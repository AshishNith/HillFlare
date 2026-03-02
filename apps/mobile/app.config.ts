import { ExpoConfig, ConfigContext } from 'expo/config';

const IS_PROD = process.env.APP_VARIANT === 'production';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

// Set your production Render API URL here
const PROD_API_URL = process.env.API_URL || 'https://hillflare-api.onrender.com';
const DEV_API_URL = 'http://localhost:4000';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'HillFlare',
  slug: 'hillflare',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  updates: {
    enabled: false,
  },
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#F7F8FA',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.hillflare.app',
  },
  android: {
    package: 'com.hillflare.app',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#F7F8FA',
    },
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    apiUrl: IS_PROD || IS_PREVIEW ? PROD_API_URL : DEV_API_URL,
    eas: {
      projectId: '6762c1f7-5536-4623-91f0-ef4736778a3f',
    },
  },
});
