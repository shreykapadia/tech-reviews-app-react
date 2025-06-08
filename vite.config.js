import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy /bestbuy-api requests to the Best Buy API
      '/bestbuy-api': {
        target: 'https://api.bestbuy.com', // The actual API server
        changeOrigin: true, // Needed for virtual hosted sites
        rewrite: (path) => path.replace(/^\/bestbuy-api/, ''), // Remove the /bestbuy-api prefix
        secure: false, // Set to true if your target API is on HTTPS and you trust its certificate
      },
    },
  },
});