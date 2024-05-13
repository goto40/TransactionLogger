import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { buildSync } from "esbuild";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
  plugins: [svelte(),
    {
      name: "build my worker",
      apply: "build",
      transformIndexHtml() {        
        buildSync({
          minify: true,
          bundle: true,
          entryPoints: ["src/service-worker.ts"],
          outfile: "public/service-worker.js",
        });
      }
    }
  ],
})
