import { useEffect, useState } from 'react';
import {
  getRemoteConfig,
  setDefaults,
  setConfigSettings,
  fetchAndActivate,
  getValue,
} from '@react-native-firebase/remote-config';

import { FIREBASE_REMOTE_CONFIG_ENABLED } from './config';

// Keys to create in Firebase Console → Remote Config
export const RC_KEYS = {
  NEWS_BANNER_TEXT: 'news_banner_text', // String: text of the banner on top of the News feed ('' = hidden)
  QUIZ_ENABLED: 'quiz_enabled', // Boolean: show "Sports Quiz" in the More tab
};

// Used until the first successful fetch (and when offline)
const DEFAULTS = {
  [RC_KEYS.NEWS_BANNER_TEXT]: '',
  [RC_KEYS.QUIZ_ENABLED]: true,
};

let ready = false;
const listeners = new Set();

export const initRemoteConfig = async () => {
  if (!FIREBASE_REMOTE_CONFIG_ENABLED) return;
  try {
    const rc = getRemoteConfig();
    await setConfigSettings(rc, { minimumFetchIntervalMillis: __DEV__ ? 0 : 3600000 });
    await setDefaults(rc, DEFAULTS);
    await fetchAndActivate(rc);
  } catch (e) {
    console.log('Remote Config init error:', e?.message);
  } finally {
    ready = true;
    listeners.forEach((cb) => cb());
  }
};

const read = (key) => {
  if (!FIREBASE_REMOTE_CONFIG_ENABLED) return null;
  try {
    return getValue(getRemoteConfig(), key);
  } catch (e) {
    return null;
  }
};

export const getRemoteString = (key) => read(key)?.asString() ?? DEFAULTS[key] ?? '';
export const getRemoteBoolean = (key) => read(key)?.asBoolean() ?? DEFAULTS[key] ?? false;
export const getRemoteNumber = (key) => read(key)?.asNumber() ?? DEFAULTS[key] ?? 0;
export const isRemoteConfigReady = () => ready;

// Re-renders the component once Remote Config values are fetched
export const useRemoteConfig = () => {
  const [, setVersion] = useState(0);
  useEffect(() => {
    const cb = () => setVersion((v) => v + 1);
    listeners.add(cb);
    return () => listeners.delete(cb);
  }, []);
  return { getString: getRemoteString, getBoolean: getRemoteBoolean, getNumber: getRemoteNumber, ready };
};
