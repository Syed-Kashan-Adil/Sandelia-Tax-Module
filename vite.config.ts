// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Essential for shadcn/ui to resolve imports like '@/components/ui/button'
      '@': path.resolve(__dirname, './src'),
    },
  },
})
