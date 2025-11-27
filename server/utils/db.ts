import { createPool } from 'mysql2/promise'
import type { Pool } from 'mysql2/promise'
import type { RuntimeConfig } from '../types/runtime-config'

let pool: Pool | null = null

export function getDatabase(): Pool {
  const config = useRuntimeConfig() as unknown as RuntimeConfig

  if (!pool) {
    pool = createPool({
      host: config.mysql.host,
      port: config.mysql.port,
      user: config.mysql.user,
      password: config.mysql.password,
      database: config.mysql.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  }

  return pool
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}
