import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        home: resolve('index.html'),
        projects: resolve('projects.html'),
        experience: resolve('experience.html'),
        certificates: resolve('certificates.html'),
        playground: resolve('playground.html'),
        flowers: resolve('bloom/index.html'),
        notFound: resolve('404.html'),
      },
      output: { manualChunks: { three: ['three'], qr: ['qrcode'] } },
    },
  },
});
