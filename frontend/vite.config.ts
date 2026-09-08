import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// La SPA corre en :5173 y habla con la API en :3000.
// Se puede sobreescribir la URL con VITE_API_URL.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
