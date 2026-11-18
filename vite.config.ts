import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  // Relative asset URLs work on GitHub Pages project sites (/owner/repo/).
  base: './',
  plugins: [react(), tailwindcss()],
});
