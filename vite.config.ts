import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig({
  // Prevent vite from obscuring rust errors
  clearScreen: false,
  server: {
    host: host || false,
    port: 5173,
    strictPort: false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 5174,
        }
      : undefined,
  },
  // to make use of `TAURI_PLATFORM`, `TAURI_ARCH`, `TAURI_FAMILY`, `TAURI_PLATFORM_VERSION`, `TAURI_PLATFORM_TYPE` and `TAURI_DEBUG`
  // env variables
  envPrefix: ['VITE_', 'TAURI_'],
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    tsconfigPaths()
  ],
  build: {
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'utils-vendor': ['dayjs', 'lucide-react', 'zustand'],
        }
      }
    }
  },
})
