
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.bid2bid.app',
  appName: 'Bid2Bid',
  webDir: 'dist',
  server: {
    url: 'app.bid2bid.io',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;
