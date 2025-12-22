import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // /api/v1로 시작하는 모든 요청을 백엔드로 전달
      '/api/v1': {
        target: 'http://localhost:8080',  // Spring Boot 백엔드 서버
        changeOrigin: true,                // 호스트 헤더를 target으로 변경
        secure: false,                     // HTTPS 검증 비활성화 (개발용)
      }
    }
  }
})

