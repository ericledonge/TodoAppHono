import type { Database as DatabaseType } from 'better-sqlite3'

import type { ITodoRepository } from '../../domain/repositories/ITodoRepository'
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../../domain/entities/Todo'
import { db as defaultDb } from '../database/database'

interface TodoRow {
  id: number
  title: string
  description: string | null
  completed: number
  user_id: string
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
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  }

  async findAll(userId: string): Promise<Todo[]> {
    const rows = this.db.prepare('SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC').all(userId) as TodoRow[]

    return rows.map(this.mapRowToTodo)
  }

  async findById(id: number, userId: string): Promise<Todo | null> {
    const row = this.db.prepare('SELECT * FROM todos WHERE id = ? AND user_id = ?').get(id, userId) as TodoRow | undefined

    return row ? this.mapRowToTodo(row) : null
  }

  async create(input: CreateTodoInput, userId: string): Promise<Todo> {
    const result = this.db.prepare(
      'INSERT INTO todos (title, description, user_id) VALUES (?, ?, ?)'
    ).run(input.title, input.description ?? null, userId)

    const todo = await this.findById(result.lastInsertRowid as number, userId)

    if (!todo) {
      throw new Error('Failed to create todo')
    }

    return todo
  }

  async update(id: number, input: UpdateTodoInput, userId: string): Promise<Todo | null> {
    const existing = await this.findById(id, userId)
    if (!existing) return null

    const title = input.title ?? existing.title
    const description = input.description !== undefined ? input.description : existing.description
    const completed = input.completed !== undefined ? (input.completed ? 1 : 0) : (existing.completed ? 1 : 0)

    this.db.prepare(`
      UPDATE todos
      SET title = ?, description = ?, completed = ?, updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).run(title, description, completed, id, userId)

    return this.findById(id, userId)
  }

  async delete(id: number, userId: string): Promise<boolean> {
    const result = this.db.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?').run(id, userId)

    return result.changes > 0
  }
}