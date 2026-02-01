import type { Database } from 'better-sqlite3'
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'

import { SqliteTodoRepository } from './SqliteTodoRepository'
import { createDatabase } from '../database/database'

describe('SqliteTodoRepository', () => {
  let db: Database
  let repo: SqliteTodoRepository

  beforeAll(() => {
    db = createDatabase(':memory:')
    repo = new SqliteTodoRepository(db)
  })

  afterAll(() => {
    db.close()
  })

  beforeEach(() => {
    db.exec('DELETE FROM todos')
  })

  describe('create', () => {
    it('should create a todo with title only', async () => {
      const todo = await repo.create({ title: 'Test todo' })

      expect(todo.id).toBeDefined()
      expect(todo.title).toBe('Test todo')
      expect(todo.description).toBeNull()
      expect(todo.completed).toBe(false)
    })

    it('should create a todo with description', async () => {
      const todo = await repo.create({ 
        title: 'Test', 
        description: 'Une description' 
      })

      expect(todo.description).toBe('Une description')
    })
  })

  describe('findAll', () => {
    it('should return empty array when no todos', async () => {
      const todos = await repo.findAll()
      expect(todos).toEqual([])
    })

    it('should return all todos', async () => {
      await repo.create({ title: 'Todo 1' })
      await repo.create({ title: 'Todo 2' })

      const todos = await repo.findAll()
      expect(todos).toHaveLength(2)
    })
  })

  describe('findById', () => {
    it('should return todo if exists', async () => {
      const created = await repo.create({ title: 'Test' })
      const found = await repo.findById(created.id)

      expect(found).not.toBeNull()
      expect(found?.title).toBe('Test')
    })

    it('should return null if not exists', async () => {
      const found = await repo.findById(9999)
      expect(found).toBeNull()
    })
  })

  describe('update', () => {
    it('should update todo', async () => {
      const created = await repo.create({ title: 'Original' })
      const updated = await repo.update(created.id, { 
        title: 'Updated',
        completed: true 
      })

      expect(updated?.title).toBe('Updated')
      expect(updated?.completed).toBe(true)
    })

    it('should return null if todo not exists', async () => {
      const result = await repo.update(9999, { title: 'Test' })
      expect(result).toBeNull()
    })
  })

  describe('delete', () => {
    it('should delete todo and return true', async () => {
      const created = await repo.create({ title: 'To delete' })
      const result = await repo.delete(created.id)

      expect(result).toBe(true)
      expect(await repo.findById(created.id)).toBeNull()
    })

    it('should return false if todo not exists', async () => {
      const result = await repo.delete(9999)
      expect(result).toBe(false)
    })
  })
})
