import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const GIST_URL = 'https://gist.githubusercontent.com/prethith/f1a144a3d8837f25029e2921bbf37e80/raw/results.json'

const VALID_STATES = new Set(['S03', 'S11', 'S22', 'S25', 'U07'])

function apiResultsMiddleware() {
  return {
    name: 'api-results',
    configureServer(server) {
      server.middlewares.use('/api/results', async (req, res) => {
        const state = new URL(req.url, 'http://localhost').searchParams.get('state')
        res.setHeader('Content-Type', 'application/json')
        if (!state || !VALID_STATES.has(state)) {
          res.writeHead(400)
          return res.end(JSON.stringify({ error: 'Invalid ?state= param' }))
        }
        try {
          const gistRes = await fetch(GIST_URL)
          const all = await gistRes.json()
          const data = all[state]
          if (!data) throw new Error(`No data for ${state}`)
          res.writeHead(200)
          res.end(JSON.stringify(data))
        } catch (e) {
          res.writeHead(500)
          res.end(JSON.stringify({ error: e.message }))
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [vue(), apiResultsMiddleware()],
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
