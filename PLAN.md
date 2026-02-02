# Plan - Todo App Backend

## Objectif
Créer un backend de todo app avec Hono et SQLite en suivant les principes de la Clean Architecture.

## Stack Technique
- **Framework**: Hono (web framework ultraléger)
- **Base de données**: SQLite avec better-sqlite3
- **Langage**: TypeScript
- **Validation**: Zod
- **Tests**: Vitest

## Structure du Projet (Clean Architecture)

```
backend/
├── src/
│   ├── domain/                    # Couche 1: Entités (cœur)
│   │   ├── entities/
│   │   │   └── Todo.ts
│   │   └── repositories/
│   │       └── ITodoRepository.ts
│   │
│   ├── application/               # Couche 2: Cas d'utilisation
│   │   └── use-cases/
│   │       ├── CreateTodoUseCase.ts
│   │       ├── GetAllTodosUseCase.ts
│   │       ├── GetTodoByIdUseCase.ts
│   │       ├── UpdateTodoUseCase.ts
│   │       └── DeleteTodoUseCase.ts
│   │
│   ├── infrastructure/            # Couche 3: Adaptateurs
│   │   ├── repositories/
│   │   │   └── SqliteTodoRepository.ts
│   │   ├── database/
│   │   │   └── database.ts
│   │   └── http/
│   │       ├── controllers/
│   │       │   └── TodoController.ts
│   │       └── routes/
│   │           └── todoRoutes.ts
│   │
│   ├── app.ts                     # Configuration Hono
│   └── index.ts                   # Point d'entrée
│
├── data/                          # Fichier SQLite
├── package.json
└── tsconfig.json
```

## API Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/todos` | Liste tous les todos |
| GET | `/api/todos/:id` | Récupère un todo par ID |
| POST | `/api/todos` | Crée un nouveau todo |
| PUT | `/api/todos/:id` | Met à jour un todo |
| PATCH | `/api/todos/:id` | Mise à jour partielle |
| DELETE | `/api/todos/:id` | Supprime un todo |
| GET | `/health` | Health check |

## Schéma Base de Données

```sql
CREATE TABLE todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
```

---

# Backlog & Suivi

## Phase 1: Configuration du Projet

- [x] 1.1 Initialiser le projet npm
- [x] 1.2 Installer les dépendances (hono, better-sqlite3, zod, tsx, typescript, vitest)
- [x] 1.3 Configurer TypeScript (tsconfig.json)
- [x] 1.4 Créer la structure des dossiers

## Phase 2: Couche Domain

- [x] 2.1 Créer l'entité Todo (`src/domain/entities/Todo.ts`)
- [x] 2.2 Créer l'interface ITodoRepository (`src/domain/repositories/ITodoRepository.ts`)

## Phase 3: Couche Infrastructure - Database

- [x] 3.1 Configurer la connexion SQLite (`src/infrastructure/database/database.ts`)
- [x] 3.2 Implémenter SqliteTodoRepository
- [x] 3.3 Écrire les tests pour SqliteTodoRepository

## Phase 4: Couche Application

- [x] 4.1 Créer CreateTodoUseCase
- [x] 4.2 Créer GetAllTodosUseCase
- [x] 4.3 Créer GetTodoByIdUseCase
- [x] 4.4 Créer UpdateTodoUseCase
- [x] 4.5 Créer DeleteTodoUseCase
- [x] 4.6 Écrire les tests pour les Use Cases

## Phase 5: Couche Infrastructure - HTTP

- [x] 5.1 Créer TodoController
- [x] 5.2 Créer les routes avec validation Zod
- [x] 5.3 Configurer l'application Hono (`src/app.ts`)
- [x] 5.4 Créer le point d'entrée (`src/index.ts`)
- [ ] 5.5 Écrire les tests d'intégration pour les routes

## Phase 6: Tests & Validation

- [x] 6.1 Démarrer le serveur et vérifier le health check
- [x] 6.2 Tester POST /api/todos (création)
- [x] 6.3 Tester GET /api/todos (liste)
- [x] 6.4 Tester GET /api/todos/:id
- [x] 6.5 Tester PUT /api/todos/:id (mise à jour)
- [x] 6.6 Tester DELETE /api/todos/:id
- [x] 6.7 Écrire des tests unitaires (optionnel)

---

# Vérification

## Commandes de test (curl)

```bash
# Health check
curl http://localhost:3000/health

# Créer un todo
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Apprendre la Clean Architecture"}'

# Lister les todos
curl http://localhost:3000/api/todos

# Récupérer un todo
curl http://localhost:3000/api/todos/1

# Mettre à jour un todo
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Supprimer un todo
curl -X DELETE http://localhost:3000/api/todos/1
```

## Checklist de validation
- [x] Le serveur démarre sans erreur (`npm run dev`)
- [x] Le health check retourne `{ "status": "ok" }`
- [x] Les todos peuvent être créés (POST retourne 201)
- [x] Les todos sont persistés en base SQLite
- [x] La validation rejette les titres vides
- [x] Les erreurs 404 sont gérées correctement

---

# Phase 7: Authentification (Better Auth)

## Objectif
Ajouter l'authentification avec Better Auth. Chaque utilisateur ne voit que ses propres todos.

## 7.1 Installation

```bash
npm install better-auth
```

## 7.2 Système de migrations SQL maison

### Structure
```
backend/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_add_user_id_to_todos.sql
│   └── 003_better_auth_tables.sql
├── src/
│   └── infrastructure/
│       └── database/
│           ├── database.ts
│           └── migrator.ts
```

### Créer `src/infrastructure/database/migrator.ts`
```typescript
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
```

### Créer `migrations/001_initial_schema.sql`
```sql
CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  completed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

### Créer `migrations/002_add_user_id_to_todos.sql`
```sql
ALTER TABLE todos ADD COLUMN user_id TEXT DEFAULT 'legacy_user';
```

### Créer `migrations/003_better_auth_tables.sql`
```sql
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  emailVerified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS "session" (
  id TEXT PRIMARY KEY,
  expiresAt TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  ipAddress TEXT,
  userAgent TEXT,
  userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  id TEXT PRIMARY KEY,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  accessToken TEXT,
  refreshToken TEXT,
  idToken TEXT,
  accessTokenExpiresAt TEXT,
  refreshTokenExpiresAt TEXT,
  scope TEXT,
  password TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS "verification" (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Modifier `src/infrastructure/database/database.ts`
```typescript
import Database, { Database as DatabaseType } from 'better-sqlite3'
import path from 'path'
import { runMigrations } from './migrator'

const isTest = process.env.NODE_ENV === 'test'

export function createDatabase(dbPath?: string): DatabaseType {
  const finalPath = dbPath ?? (isTest ? ':memory:' : path.join(process.cwd(), 'data', 'todos.db'))
  const db = new Database(finalPath)

  // Exécuter les migrations
  const migrationsPath = path.join(process.cwd(), 'migrations')
  runMigrations(db, migrationsPath)

  return db
}

export const db = createDatabase()
```

**Note** : Les todos existants gardent `user_id = 'legacy_user'`.

## 7.4 Middleware d'authentification

### Créer `src/infrastructure/http/middlewares/authMiddleware.ts`
```typescript
import { createMiddleware } from "hono/factory"
import { auth } from "../../auth/auth"

export const authMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  c.set("user", session.user)
  c.set("session", session.session)
  await next()
})
```

## 7.5 Intégrer dans l'app

### Modifier `src/app.ts`
```typescript
// Routes auth (publiques)
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))

// Routes todos (protégées)
app.use("/api/todos/*", authMiddleware)
app.route("/api/todos", todoRoutes)
```

## 7.6 Fichiers à créer/modifier

| Fichier | Action |
|---------|--------|
| `migrations/001_initial_schema.sql` | Créer |
| `migrations/002_add_user_id_to_todos.sql` | Créer |
| `migrations/003_better_auth_tables.sql` | Créer |
| `src/infrastructure/database/migrator.ts` | Créer |
| `src/infrastructure/database/database.ts` | Modifier (appeler migrator) |
| `src/infrastructure/auth/auth.ts` | Modifier (déjà créé) |
| `src/infrastructure/http/middlewares/authMiddleware.ts` | Créer |
| `src/domain/entities/Todo.ts` | Ajouter userId |
| `src/domain/repositories/ITodoRepository.ts` | Ajouter userId aux méthodes |
| `src/infrastructure/repositories/SqliteTodoRepository.ts` | Filtrer par user_id |
| `src/app.ts` | Intégrer auth + middleware |
| `src/infrastructure/http/controllers/TodoController.ts` | Passer userId |
| `src/application/use-cases/*.ts` | Ajouter userId |

## 7.7 Nouveaux endpoints auth

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/sign-up` | Inscription |
| POST | `/api/auth/sign-in` | Connexion |
| POST | `/api/auth/sign-out` | Déconnexion |
| GET | `/api/auth/session` | Session actuelle |

## 7.8 Commandes de test

```bash
# Inscription
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test"}'

# Connexion
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  -c cookies.txt

# Créer un todo (avec auth)
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title": "Mon todo"}'

# Sans auth = 401
curl http://localhost:3000/api/todos
```

## Checklist Phase 7

### Étape 1: Système de migrations
- [x] 7.1 Créer le dossier `migrations/`
- [x] 7.2 Créer `migrations/001_initial_schema.sql`
- [x] 7.3 Créer `migrations/002_add_user_id_to_todos.sql`
- [x] 7.4 Créer `migrations/003_better_auth_tables.sql`
- [x] 7.5 Créer `src/infrastructure/database/migrator.ts`
- [x] 7.6 Modifier `database.ts` pour utiliser le migrator

### Étape 2: Better Auth
- [x] 7.7 Installer better-auth
- [x] 7.8 Compléter la config auth (baseURL)

### Étape 3: Middleware et intégration
- [x] 7.9 Créer `authMiddleware.ts`
- [x] 7.10 Intégrer dans `app.ts`

### Étape 4: Mise à jour du domaine
- [x] 7.11 Ajouter userId à l'entité Todo
- [x] 7.12 Mettre à jour ITodoRepository
- [x] 7.13 Mettre à jour SqliteTodoRepository
- [x] 7.14 Mettre à jour les Use Cases
- [x] 7.15 Mettre à jour TodoController

### Étape 5: Tests
- [x] 7.16 Tester inscription/connexion
- [x] 7.17 Vérifier que les routes todos sont protégées

---

# Phase 8: Déploiement Railway

## Objectif
Déployer le backend sur Railway avec support des environnements multiples (staging/production).

## Pourquoi Railway?
- **~5$/mois** (plan Hobby + usage)
- Interface web intuitive
- Volumes persistants pour SQLite
- Environnements multiples intégrés
- Déploiement simple via CLI ou GitHub

## 8.1 Préparer le code

### Modifier `src/infrastructure/database/database.ts`
Ajouter le support de la variable `DATABASE_PATH` pour Railway :

```typescript
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
```

## 8.2 Déploiement initial

### Créer un compte Railway
1. Aller sur https://railway.app
2. Se connecter avec GitHub

### Installer le CLI
```bash
npm install -g @railway/cli
railway login
```

### Initialiser le projet
```bash
cd backend
railway init
# Choisir "Empty Project" ou lier à un repo GitHub
```

### Créer un volume pour SQLite
Dans le Dashboard Railway :
1. Aller dans ton service
2. Cliquer **"Add Volume"**
3. Mount path: `/data`
4. Nom: `sqlite-data`

### Configurer les variables d'environnement
Dans Railway Dashboard → Variables :
```
DATABASE_PATH=/data/todos.db
BETTER_AUTH_BASE_URL=https://[ton-app].up.railway.app
NODE_ENV=production
```

### Déployer
```bash
railway up
```

## 8.3 Environnements multiples

### Créer l'environnement staging
```bash
railway environment create staging
```

### Déployer sur staging
```bash
railway environment staging
railway up
```

### Déployer en production
```bash
railway environment production
railway up
```

### Variables par environnement

| Variable | Local | Staging | Production |
|----------|-------|---------|------------|
| `DATABASE_PATH` | `data/todos.db` | `/data/todos.db` | `/data/todos.db` |
| `BETTER_AUTH_BASE_URL` | `http://localhost:3000` | `https://todo-staging.up.railway.app` | `https://todo-prod.up.railway.app` |
| `NODE_ENV` | `development` | `staging` | `production` |

## 8.4 Fichiers à modifier

| Fichier | Action |
|---------|--------|
| `src/infrastructure/database/database.ts` | Ajouter support `DATABASE_PATH` |

## 8.5 Commandes de vérification

```bash
# Health check en production
curl https://[ton-app].up.railway.app/health

# Inscription
curl -X POST https://[ton-app].up.railway.app/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test"}'

# Connexion
curl -X POST https://[ton-app].up.railway.app/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  -c cookies.txt

# Créer un todo
curl -X POST https://[ton-app].up.railway.app/api/todos \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title": "Mon premier todo en prod!"}'
```

## Checklist Phase 8

- [ ] 8.1 Modifier `database.ts` pour supporter `DATABASE_PATH`
- [ ] 8.2 Créer un compte Railway
- [ ] 8.3 Installer le CLI Railway
- [ ] 8.4 Initialiser le projet (`railway init`)
- [ ] 8.5 Créer un volume (`/data`)
- [ ] 8.6 Configurer les variables d'environnement
- [ ] 8.7 Déployer (`railway up`)
- [ ] 8.8 Tester le health check en production
- [ ] 8.9 Tester l'authentification en production
- [ ] 8.10 (Optionnel) Créer l'environnement staging

---

# Évolutions Futures

1. ~~**Authentification** - Ajouter JWT ou sessions~~ ✅ Phase 7
2. ~~**Déploiement** - Déployer sur Railway~~ ✅ Phase 8
3. **Filtrage** - Filtrer par statut (completed/pending)
4. **Pagination** - Paginer la liste des todos
5. **Frontend** - Connecter une app React/Vue
