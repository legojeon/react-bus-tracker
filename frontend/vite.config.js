import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // 외부 접근 허용
    port: 5173,
    strictPort: true,
  },
  build: {
    // 빌드 시 상대경로 사용
    base: './',
    outDir: 'dist',
    cssCodeSplit: false, // CSS 분할 비활성화
    rollupOptions: {
      output: {
        manualChunks: undefined, // 청크 분할 비활성화
      }
    }
  },
  define: {
    // 환경 변수를 클라이언트에서 사용할 수 있도록 설정
    'process.env': {}
  }
})
