import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.cw2.clutch',
  appName: 'Clutch',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
