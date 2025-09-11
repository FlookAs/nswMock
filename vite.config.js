import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    
    // Define global constants
    define: {
      // Make env variables available in client code
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV),
    },
    
    // Development server configuration
    server: {
      port: 3000,
      open: true, // เปิดบราวเซอร์อัตโนมัติ
      host: true, // ให้เข้าถึงได้จาก network
    },
    
    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          // จัดกลุ่มไฟล์ให้เป็นระเบียบ
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
    },
    
    // Preview server (สำหรับ npm run preview)
    preview: {
      port: 4173,
      open: true,
    },
    
    // CSS configuration
    css: {
      devSourcemap: true,
    },
    
    // Environment variables prefix
    envPrefix: 'VITE_',
  }
})