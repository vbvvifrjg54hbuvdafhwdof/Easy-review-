import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function githubPagesRootSyncPlugin(): Plugin {
  return {
    name: 'github-pages-root-sync',
    enforce: 'pre',
    transformIndexHtml: {
      order: 'pre',
      handler(html: string) {
        // In dev mode, replace the static script tag with live module entry
        return html
          .replace('<script type="module" crossorigin src="./assets/app.js"></script>', '<script type="module" src="/src/main.tsx"></script>')
          .replace('<link rel="stylesheet" crossorigin href="./assets/app.css" />', '');
      },
    },
    closeBundle() {
      try {
        const rootDir = process.cwd();
        const distDir = path.join(rootDir, 'dist');
        const distAssetsDir = path.join(distDir, 'assets');
        const rootAssetsDir = path.join(rootDir, 'assets');

        if (fs.existsSync(distAssetsDir)) {
          if (!fs.existsSync(rootAssetsDir)) {
            fs.mkdirSync(rootAssetsDir, { recursive: true });
          }
          const files = fs.readdirSync(distAssetsDir);
          for (const file of files) {
            fs.copyFileSync(path.join(distAssetsDir, file), path.join(rootAssetsDir, file));
          }
        }

        // Copy static root files from public / dist to workspace root
        const staticFiles = ['.nojekyll', 'icon.svg', 'manifest.json', 'sw.js', '404.html'];
        for (const file of staticFiles) {
          const srcPath = path.join(distDir, file);
          const destPath = path.join(rootDir, file);
          if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      } catch (err) {
        console.error('Failed to sync files to root:', err);
      }
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [githubPagesRootSyncPlugin(), react(), tailwindcss()],
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
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

