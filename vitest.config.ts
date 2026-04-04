import path from 'node:path'
import { loadEnvConfig } from '@next/env'
import { defineConfig } from 'vitest/config'

loadEnvConfig(process.cwd())
const isSupabaseIntegrationMode = process.env.VITEST_SUPABASE_MODE === 'true'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    hookTimeout: isSupabaseIntegrationMode ? 30000 : undefined,
    testTimeout: isSupabaseIntegrationMode ? 30000 : undefined,
  },
})
