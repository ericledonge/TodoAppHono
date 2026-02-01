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

# Évolutions Futures

1. **Authentification** - Ajouter JWT ou sessions
2. **Filtrage** - Filtrer par statut (completed/pending)
3. **Pagination** - Paginer la liste des todos
4. **Frontend** - Connecter une app React/Vue
