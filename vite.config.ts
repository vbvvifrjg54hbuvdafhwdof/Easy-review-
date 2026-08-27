import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function staticEntryPlugin(): Plugin {
  return {
    name: 'static-entry-transform',
    enforce: 'pre',
    transformIndexHtml: {
      order: 'pre',
      handler(html: string) {
        return html
          .replace('<script type="module" crossorigin src="./assets/app.js"></script>', '<script type="module" src="/src/main.tsx"></script>')
          .replace('<link rel="stylesheet" crossorigin href="./assets/app.css" />', '');
      },
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [staticEntryPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          entryFileNames: 'assets/app.js',
          chunkFileNames: 'assets/app-[name].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'assets/app.css';
            }
            return 'assets/[name].[ext]';
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
