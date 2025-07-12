import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.Clutch',
  appName: 'Clutch',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
