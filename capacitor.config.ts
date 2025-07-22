
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.bid2bid.app',
  appName: 'Bid2Bid',
  webDir: 'dist',
  server: {
    url: 'https://737599d9-a4e3-4b3e-a7d4-dc510c5dbfee.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false,
  plugins: {
    InAppPurchase2: {
      // Enable detailed logging for debugging
      verbose: true
    }
  }
};

export default config;
