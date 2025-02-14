import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import { cjsInterop } from 'vite-plugin-cjs-interop';

dotenv.config({ path: './.env' });

export default defineConfig({
  plugins: [reactRouter(), cjsInterop({ dependencies: ['react-use-websocket'] })],
});
