import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  base: './',
  plugins: [tailwindcss()],
  resolve: { dedupe: ['three'] },
  optimizeDeps: { include: ['three', 'three/addons/environments/RoomEnvironment.js', 'three/addons/utils/BufferGeometryUtils.js'] },
  build: {
    rollupOptions: {
      input: {
        home: resolve('index.html'),
        projects: resolve('projects.html'),
        experience: resolve('experience.html'),
        certificates: resolve('certificates.html'),
        skills: resolve('skills.html'),
        playground: resolve('playground.html'),
        flowers: resolve('bloom/index.html'),
        arcade: resolve('arcade/index.html'),
        study: resolve('study/index.html'),
        ink: resolve('ink/index.html'),
        babel: resolve('babel/index.html'),
        notFound: resolve('404.html'),
      },
      output: { manualChunks(id) { if(id.includes('/node_modules/three/')) return 'three'; if(id.includes('/node_modules/qrcode/')) return 'qr'; } },
    },
  },
});
