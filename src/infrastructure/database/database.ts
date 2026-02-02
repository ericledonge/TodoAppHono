import Database, { Database as DatabaseType } from 'better-sqlite3'
import path from 'path'
import { runMigrations } from './migrator'

const isTest = process.env.NODE_ENV === 'test'

export function createDatabase(dbPath?: string): DatabaseType {
  // Railway utilise DATABASE_PATH pour pointer vers le volume
  const finalPath = dbPath ?? process.env.DATABASE_PATH ?? (isTest ? ':memory:' : path.join(process.cwd(), 'data', 'todos.db'))
  const db = new Database(finalPath)

  // Exécuter les migrations
  const migrationsPath = path.join(process.cwd(), 'migrations')
  runMigrations(db, migrationsPath)

  return db
}

export const db = createDatabase()
