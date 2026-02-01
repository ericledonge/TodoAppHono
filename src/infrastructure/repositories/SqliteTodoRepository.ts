import type { Database as DatabaseType } from 'better-sqlite3'

import type { ITodoRepository } from '../../domain/repositories/ITodoRepository'
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../../domain/entities/Todo'
import { db as defaultDb } from '../database/database'

interface TodoRow {
  id: number
  title: string
  description: string | null
  completed: number
  created_at: string
  updated_at: string
}

export class SqliteTodoRepository implements ITodoRepository {
  private db: DatabaseType;

  constructor(db: DatabaseType = defaultDb) {
    this.db = db
  }

  private mapRowToTodo(row: TodoRow): Todo {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      completed: row.completed === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  }

  async findAll(): Promise<Todo[]> {
    const rows = this.db.prepare('SELECT * FROM todos ORDER BY created_at DESC').all() as TodoRow[]

    return rows.map(this.mapRowToTodo)
  }

  async findById(id: number): Promise<Todo | null> {
    const row = this.db.prepare('SELECT * FROM todos WHERE id = ?').get(id) as TodoRow | undefined

    return row ? this.mapRowToTodo(row) : null
  }

  async create(input: CreateTodoInput): Promise<Todo> {
    const result = this.db.prepare(
      'INSERT INTO todos (title, description) VALUES (?, ?)'
    ).run(input.title, input.description ?? null)

    const todo = await this.findById(result.lastInsertRowid as number)

    if (!todo) {
      throw new Error('Failed to create todo')
    }

    return todo
  }

  async update(id: number, input: UpdateTodoInput): Promise<Todo | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const title = input.title ?? existing.title
    const description = input.description !== undefined ? input.description : existing.description
    const completed = input.completed !== undefined ? (input.completed ? 1 : 0) : (existing.completed ? 1 : 0)

    this.db.prepare(`
      UPDATE todos 
      SET title = ?, description = ?, completed = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(title, description, completed, id)

    return this.findById(id)
  }

  async delete(id: number): Promise<boolean> {
    const result = this.db.prepare('DELETE FROM todos WHERE id = ?').run(id)

    return result.changes > 0
  }
}