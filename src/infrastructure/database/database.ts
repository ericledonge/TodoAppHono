import Database, { Database as DatabaseType } from 'better-sqlite3'
import path from 'path'

const isTest = process.env.NODE_ENV === 'test'

export function createDatabase(dbPath?: string): DatabaseType {
  const finalPath = dbPath ?? (isTest ? ':memory:' : path.join(process.cwd(), 'data', 'todos.db'))
  const db = new Database(finalPath)

  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)

  return db
}

export const db = createDatabase()
