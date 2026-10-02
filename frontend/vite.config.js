import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['bitter-buttons-say.loca.lt', 'localhost', '127.0.0.1']
  }
})
