import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  base: './',
  resolve: { dedupe: ['three'] },
  optimizeDeps: { include: ['three', 'three/addons/environments/RoomEnvironment.js', 'three/addons/utils/BufferGeometryUtils.js'] },
  build: {
    rollupOptions: {
      input: {
        home: resolve('index.html'),
        projects: resolve('projects.html'),
        experience: resolve('experience.html'),
        certificates: resolve('certificates.html'),
        playground: resolve('playground.html'),
        flowers: resolve('bloom/index.html'),
        arcade: resolve('arcade/index.html'),
        study: resolve('study/index.html'),
        notFound: resolve('404.html'),
      },
      output: { manualChunks(id) { if(id.includes('/node_modules/three/')) return 'three'; if(id.includes('/node_modules/qrcode/')) return 'qr'; } },
    },
  },
});
