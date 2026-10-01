import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const projectId =
    process.env.VITE_FIREBASE_PROJECT_ID === '62544'
      ? 'maman-62544'
      : process.env.VITE_FIREBASE_PROJECT_ID || 'maman-62544';

  return {
    define: {
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(projectId),
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
