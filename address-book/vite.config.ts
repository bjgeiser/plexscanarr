import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

export default defineConfig({
  plugins: [reactRouter()],
});
