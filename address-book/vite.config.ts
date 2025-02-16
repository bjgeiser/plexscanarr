import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import { cjsInterop } from 'vite-plugin-cjs-interop';
import react from '@vitejs/plugin-react';

dotenv.config({ path: './.env' });

export default defineConfig({
  plugins: [react(), reactRouter(), cjsInterop({ dependencies: ['react-use-websocket'] })],
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
});
