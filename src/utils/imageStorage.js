import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

const LOGO_DIR = 'logos/';

// iOS changes the app container path between installs/updates,
// so we store paths relative to documentDirectory and resolve them at render time.
export const resolveLocalUri = (uri) => {
  if (!uri) return null;
  if (/^(https?:|file:|data:|content:)/.test(uri)) return uri;
  return `${FileSystem.documentDirectory}${uri}`;
};

export const pickTeamLogo = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.6,
  });
  if (result.canceled || !result.assets?.length) return null;

  const src = result.assets[0].uri;
  const ext = (src.split('.').pop() || 'jpg').split('?')[0].toLowerCase();
  const relative = `${LOGO_DIR}${Date.now()}.${ext}`;

  try {
    await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}${LOGO_DIR}`, { intermediates: true });
    await FileSystem.copyAsync({ from: src, to: `${FileSystem.documentDirectory}${relative}` });
    return relative;
  } catch (e) {
    console.log('Logo copy failed:', e);
    return src;
  }
};

export const deleteLocalImage = async (uri) => {
  if (!uri || /^(https?:|data:|content:)/.test(uri)) return;
  try {
    await FileSystem.deleteAsync(resolveLocalUri(uri), { idempotent: true });
  } catch (e) {
    // ignore
  }
};
