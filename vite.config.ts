import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 5174,
      strictPort: true,
    },
    define: {
      'process.env.VITE_OPENROUTER_API_KEY': JSON.stringify(env.VITE_OPENROUTER_API_KEY),
      'process.env.VITE_AI_MODEL': JSON.stringify(env.VITE_AI_MODEL),
      'process.env.VITE_YOUTUBE_API_TOKEN': JSON.stringify(env.VITE_YOUTUBE_API_TOKEN),
      'process.env.VITE_YOUTUBE_CHANNEL_ID': JSON.stringify(env.VITE_YOUTUBE_CHANNEL_ID),
      'process.env.VITE_FORUM_API_URL': JSON.stringify(env.VITE_FORUM_API_URL),
      'process.env.VITE_FORUM_API_KEY': JSON.stringify(env.VITE_FORUM_API_KEY),
    },
  };
});
