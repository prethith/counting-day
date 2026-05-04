import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'd3': ['d3', 'topojson-client'],
          'vue': ['vue']
        }
      }
    }
  }
})
