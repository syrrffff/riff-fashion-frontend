import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 1. Tambahkan baris ini

// https://vitejs.dev/config/
export default defineConfig({
  // Gunakan '/' bukannya './' agar path asset bersih
  // base: '/', // Pastikan ini '/'
  // plugins: [react()],
  // preview: {
  //   host: '0.0.0.0', // Agar bisa diakses dari IP mana pun
  //   port: 4173,
  //   allowedHosts: true // Izinkan semua host (termasuk IP & ngrok)
  // },
  // preview: {
  //   port: 4173,
  //   host: true,
  //   allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev']
  // }
})
