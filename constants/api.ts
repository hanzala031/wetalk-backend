import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = '5000';

function getExpoDevHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    (Constants as { manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } } })
      .manifest2?.extra?.expoGo?.debuggerHost;

  if (!hostUri) {
    return null;
  }

  return hostUri.split(':')[0] || null;
}

function resolveApiHost(): string {
  const expoHost = getExpoDevHost();
  if (expoHost && expoHost !== 'localhost' && expoHost !== '127.0.0.1') {
    return expoHost;
  }

  if (process.env.EXPO_PUBLIC_API_HOST) {
    return process.env.EXPO_PUBLIC_API_HOST;
  }

  if (process.env.REACT_NATIVE_PACKAGER_HOSTNAME) {
    return process.env.REACT_NATIVE_PACKAGER_HOSTNAME;
  }

  if (Platform.OS === 'android') {
    return expoHost === 'localhost' || expoHost === '127.0.0.1' ? '10.0.2.2' : 'localhost';
  }

  if (Platform.OS === 'web' || Platform.OS === 'ios') {
    return expoHost || 'localhost';
  }

  return 'localhost';
}

function buildApiUrl(host: string): string {
  return `http://${host}:${API_PORT}/api`;
}

export const API_HOST = resolveApiHost();
export const API_URL = process.env.EXPO_PUBLIC_API_URL || buildApiUrl(API_HOST);
export const API_HEALTH_URL = API_URL.replace(/\/api\/?$/, '/health');
