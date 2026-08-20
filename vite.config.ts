import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Relative asset URLs, so the build works wherever it is served from: a
  // project page (juliusvaart.github.io/table/), a user page, or a custom
  // domain. There is no client-side routing, so relative paths are safe.
  base: './'
})
