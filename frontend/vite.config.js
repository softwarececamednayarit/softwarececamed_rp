import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy'; // <--- Importamos el plugin de legacy

export default defineConfig({
  plugins: [
    react(),
    legacy({
      // Esto genera código compatible con Chrome 109 (el último de Windows 7)
      targets: ['defaults', 'not IE 11', 'chrome 109'], 
    }),
  ],
  build: {
    // Asegura que el formato del código final sea entendible por navegadores de hace unos años
    target: 'es2015', 
  },
});