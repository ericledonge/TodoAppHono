import type { Database } from "better-sqlite3"
import fs from "fs"
import path from "path"

export function runMigrations(db: Database, migrationsPath: string) {
  // 1. Créer la table de tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `)

  // 2. Lire les migrations déjà appliquées
  const applied = db.prepare('SELECT name FROM schema_migrations').all() as { name: string }[]
  const appliedNames = new Set(applied.map(m => m.name))

  // 3. Lire et trier les fichiers de migration
  const files = fs.readdirSync(migrationsPath)
    .filter(f => f.endsWith('.sql'))
    .sort()

  // 4. Exécuter les migrations manquantes
  for (const file of files) {
    if (!appliedNames.has(file)) {
      const sql = fs.readFileSync(path.join(migrationsPath, file), 'utf-8')
      db.exec(sql)
      db.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(file)
      console.log(`Migration applied: ${file}`)
    }
  }
}
