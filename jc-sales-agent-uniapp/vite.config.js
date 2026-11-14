import { defineConfig, loadEnv } from 'vite'
import uniModule from '@dcloudio/vite-plugin-uni'

const uni = typeof uniModule === 'function' ? uniModule : uniModule.default
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [uni()],
    server: {
      proxy: Object.fromEntries(['/auth', '/agent'].map(path => [path, {
        target: env.VITE_PROXY_TARGET || 'http://localhost:8087',
        changeOrigin: true,
      }])),
    },
  }
})
