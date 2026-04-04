import path from 'node:path'
import { spawnSync } from 'node:child_process'
import nextEnv from '@next/env'

const { loadEnvConfig } = nextEnv

const projectDir = process.cwd()

loadEnvConfig(projectDir)
process.env.VITEST_SUPABASE_MODE = 'true'

const vitestBin = path.join(
  projectDir,
  'node_modules',
  'vitest',
  'vitest.mjs'
)

const result = spawnSync(
  process.execPath,
  [vitestBin, 'run', 'tests/integration/supabase'],
  {
    cwd: projectDir,
    env: process.env,
    stdio: 'inherit',
  }
)

if (typeof result.status === 'number') {
  process.exit(result.status)
}

process.exit(1)
