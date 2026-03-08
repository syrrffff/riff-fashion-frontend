import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- Ini mesin pemanggil Tailwind v4

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- Wajib dipasang di sini
  ],
  // Baris ini biarkan saja untuk mencegah layar putih "React not defined"
  esbuild: {
    jsxInject: `import React from 'react'`
  }
})
