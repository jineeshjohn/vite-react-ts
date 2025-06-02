import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// suffix helper for CodeSandbox sub-domains
const CSB_SUFFIX = '.csb.app';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@api': resolve(__dirname, 'api'),
    },
  },
  server: {
    host: true, // listen on 0.0.0.0 so CodeSandbox can tunnel
    proxy: {
      '/api': 'http://localhost:3000',
    },

    //   ①  allow all *.csb.app sub-domains
    //   ②  keep localhost/127.0.0.1 implicitly allowed
    allowedHosts: [CSB_SUFFIX], // or simply 'all' to disable the check
  },
});
