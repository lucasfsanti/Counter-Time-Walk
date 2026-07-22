import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
  plugins: [
    vue({ template: { transformAssetUrls: { tags: {} } } }),
    AutoImport({
      dts: false,
      imports: [
        'vue',
        { from: fileURLToPath(new URL('./tests/support/nuxtAppMocks.ts', import.meta.url)), imports: ['useHead', 'useRuntimeConfig'] },
      ],
      dirs: ['app/composables', 'app/utils'],
    }),
  ],
  test: {
    environment: 'node',
    include: ['tests/**/*.spec.ts'],
  },
})
