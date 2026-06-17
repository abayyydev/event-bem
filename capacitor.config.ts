import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bem.eventapp',
  appName: 'BEM Event',
  webDir: 'out',
  server: {
    url: 'https://event-bem.vercel.app/',
    cleartext: true
  }
};

export default config;
