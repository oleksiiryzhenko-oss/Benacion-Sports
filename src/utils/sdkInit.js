import { Platform } from 'react-native';
import appsFlyer from 'react-native-appsflyer';
import { OneSignal } from 'react-native-onesignal';
import { getAnalytics, logEvent, logScreenView } from '@react-native-firebase/analytics';

import {
  ONESIGNAL_APP_ID,
  APPSFLYER_DEV_KEY,
  APPSFLYER_IOS_APP_ID,
  FIREBASE_ANALYTICS_ENABLED,
} from './config';
import { initRemoteConfig } from './remoteConfig';

let initialized = false;

// Initializes OneSignal / AppsFlyer only when keys are configured in utils/config.js
export const initSdks = () => {
  if (initialized) return;
  initialized = true;

  initRemoteConfig();

  if (ONESIGNAL_APP_ID) {
    try {
      OneSignal.initialize(ONESIGNAL_APP_ID);
      OneSignal.Notifications.requestPermission(false);
    } catch (e) {
      console.log('OneSignal init error:', e);
    }
  }

  if (APPSFLYER_DEV_KEY) {
    appsFlyer
      .initSdk({
        devKey: APPSFLYER_DEV_KEY,
        appId: Platform.OS === 'ios' ? APPSFLYER_IOS_APP_ID : undefined,
        isDebug: __DEV__,
        onInstallConversionDataListener: true,
        onDeepLinkListener: true,
        timeToWaitForATTUserAuthorization: 10,
      })
      .catch((e) => console.log('AppsFlyer init error:', e));
  }
};

export const trackScreen = (screenName) => {
  if (!FIREBASE_ANALYTICS_ENABLED || !screenName) return;
  logScreenView(getAnalytics(), { screen_name: screenName, screen_class: screenName }).catch(() => {});
};

export const trackEvent = (name, params = {}) => {
  if (!FIREBASE_ANALYTICS_ENABLED) return;
  logEvent(getAnalytics(), name, params).catch(() => {});
};
