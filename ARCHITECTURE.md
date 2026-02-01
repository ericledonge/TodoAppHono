# Architecture - Todo App Backend

## Vue d'ensemble

┌─────────────────────────────────────────────────────────────────────────────┐
│                              VOTRE APPLICATION                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  COUCHE DOMAIN (src/domain/)                                                │
│  ══════════════════════════                                                 │
│  Le cœur métier - AUCUNE dépendance externe                                 │
│                                                                             │
│  ┌─────────────────────┐      ┌──────────────────────────┐                  │
│  │  entities/Todo.ts   │      │ repositories/            │                  │
│  │  ─────────────────  │      │ ITodoRepository.ts       │                  │
│  │                     │      │ ────────────────────     │                  │
│  │  interface Todo {   │      │                          │                  │
│  │    id: number       │◄─────│ interface ITodoRepository│                  │
│  │    title: string    │      │   findAll(): Todo[]      │                  │
│  │    description      │      │   findById(id): Todo     │                  │
│  │    completed        │      │   create(input): Todo    │                  │
│  │    createdAt        │      │   update(id, input): Todo│                  │
│  │    updatedAt        │      │   delete(id): boolean    │                  │
│  │  }                  │      │                          │                  │
│  └─────────────────────┘      └────────────▲─────────────┘                  │
│                                            │                                │
│         "Qu'est-ce qu'un Todo ?"           │  "Contrat : ce qu'on peut      │
│                                            │   faire avec les Todos"        │
└────────────────────────────────────────────┼────────────────────────────────┘
│                                            |
│ implements                                 |
│ (respecte le contrat)                      |
│                                            |
┌────────────────────────────────────────────┼────────────────────────────────┐
│  COUCHE INFRASTRUCTURE (src/infrastructure/)                                │
│  ═══════════════════════════════════════════                                │
│  Implémentations concrètes - dépend du monde extérieur                      │
│                                             │                               │
│  ┌──────────────────────────────────────────┼─────────────────────────────┐ │
│  │  repositories/SqliteTodoRepository.ts    │                             │ │
│  │  ────────────────────────────────────────┴──────                       │ │
│  │                                                                        │ │
│  │  class SqliteTodoRepository implements ITodoRepository {               │ │
│  │                                                                        │ │
│  │    constructor(private db: Database) { }  ◄──── Injection de dépendance│ │
│  │                                                                        │ │
│  │    findAll()  → SELECT * FROM todos                                    │ │
│  │    findById() → SELECT * FROM todos WHERE id = ?                       │ │
│  │    create()   → INSERT INTO todos ...                                  │ │
│  │    update()   → UPDATE todos SET ...                                   │ │
│  │    delete()   → DELETE FROM todos WHERE id = ?                         │ │
│  │  }                                                                     │ │
│  └───────────────────────────────┬────────────────────────────────────────┘ │
│                                  │                                          │
│                                  │ utilise                                  │
│                                  ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  database/database.ts                                           │        │
│  │  ────────────────────                                           │        │
│  │                                                                 │        │
│  │  createDatabase(path) → crée/ouvre une base SQLite              │        │
│  │                                                                 │        │
│  │  db = createDatabase('data/todos.db')  ← instance par défaut    │        │
│  └─────────────────────────────────┬───────────────────────────────┘        │
│                                    │                                        │
└────────────────────────────────────┼────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  FICHIER SQLITE                                                             │
│  ══════════════                                                             │
│                                                                             │
│  data/todos.db                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  TABLE todos                                                    │        │
│  │  ├── id INTEGER PRIMARY KEY                                     │        │
│  │  ├── title TEXT                                                 │        │
│  │  ├── description TEXT                                           │        │
│  │  ├── completed INTEGER (0 ou 1)                                 │        │
│  │  ├── created_at TEXT                                            │        │
│  │  └── updated_at TEXT                                            │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Flux d'une requête HTTP

┌─────────────────────────────────────────────────────────────────────────────┐
│                         REQUÊTE HTTP                                         │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  Routes (todoRoutes.ts)                                         │        │
│  │  POST /api/todos  →  validation Zod  →  controller.create()     │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  Controller (TodoController.ts)                                 │        │
│  │  Appelle le Use Case, formate la réponse HTTP                   │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  Use Case (CreateTodoUseCase.ts)                                │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  Repository (SqliteTodoRepository.ts)                           │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  Base de données SQLite                                         │        │
│  └─────────────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Flux d'une opération (exemple : créer un todo)

Votre code                    Repository                      Base de données
│                             │                                 │
│  repo.create({              │                                 │
│    title: "Acheter pain"    │                                 │
│  })                         │                                 │
│ ───────────────────────────>│                                 │
│                             │                                 │
│                             │  INSERT INTO todos              │
│                             │  (title) VALUES (?)             │
│                             │ ───────────────────────────────>│
│                             │                                 │
│                             │          lastInsertRowid: 1     │
│                             │ <───────────────────────────────│
│                             │                                 │
│                             │  SELECT * FROM todos            │
│                             │  WHERE id = 1                   │
│                             │ ───────────────────────────────>│
│                             │                                 │
│                             │          { id: 1, title: ... }  │
│                             │ <───────────────────────────────│
│                             │                                 │
│     Todo {                  │                                 │
│       id: 1,                │                                 │
│       title: "Acheter pain",│                                 │
│       completed: false,     │                                 │
│       ...                   │                                 │
│     }                       │                                 │
│ <───────────────────────────│                                 │
│                             │                                 │



---

## Tests : Production vs Mémoire

┌─────────────────────────────────────────────────────────────────────────────┐
│                              EN PRODUCTION                                   │
│                                                                             │
│   new SqliteTodoRepository()     ───►  db par défaut  ───►  data/todos.db   │
│                                        (fichier réel)                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              EN TESTS                                        │
│                                                                             │
│   testDb = createDatabase(':memory:')                                       │
│   new SqliteTodoRepository(testDb)  ───►  testDb  ───►  :memory:            │
│                                           (RAM, isolé, jetable)             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Pyramide des tests

┌─────────────────────────────────────────────────────────────────────────────┐
│                        PYRAMIDE DES TESTS                                    │
│                                                                             │
│                            ╱╲                                               │
│                           ╱  ╲      Tests E2E (curl, Postman)               │
│                          ╱────╲     → Peu, lents                            │
│                         ╱      ╲                                            │
│                        ╱────────╲   Tests d'intégration                     │
│                       ╱          ╲  → SqliteTodoRepository + :memory:       │
│                      ╱────────────╲                                         │
│                     ╱              ╲ Tests unitaires                        │
│                    ╱────────────────╲→ Use Cases + InMemoryRepository       │
│                   ╱                  ╲  Beaucoup, rapides                   │
│                  ╱────────────────────╲                                     │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Structure des dossiers

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
