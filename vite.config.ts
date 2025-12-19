import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteCommonjs } from "@originjs/vite-plugin-commonjs"
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteCommonjs(),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@components": resolve(__dirname, "./src/components"),
      "@axios": resolve(__dirname, "./src/axios"),
      "@tools": resolve(__dirname, "./src/tools"),
    }
  },
  optimizeDeps: {
    exclude: [
      "@cornerstonejs/dicom-image-loader",
      "@cornerstonejs/codec-libjpeg-turbo-8bit",
      "jpeg-lossless-decoder-js"
    ],
    include: ["dicom-parser"],
  },
})
