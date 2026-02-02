import type { Database } from 'better-sqlite3'
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'

import { SqliteTodoRepository } from './SqliteTodoRepository'
import { createDatabase } from '../database/database'

const TEST_USER_ID = 'test-user-123'

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
      const todo = await repo.create({ title: 'Test todo' }, TEST_USER_ID)

      expect(todo.id).toBeDefined()
      expect(todo.title).toBe('Test todo')
      expect(todo.description).toBeNull()
      expect(todo.completed).toBe(false)
      expect(todo.userId).toBe(TEST_USER_ID)
    })

    it('should create a todo with description', async () => {
      const todo = await repo.create({
        title: 'Test',
        description: 'Une description'
      }, TEST_USER_ID)

      expect(todo.description).toBe('Une description')
    })
  })

  describe('findAll', () => {
    it('should return empty array when no todos', async () => {
      const todos = await repo.findAll(TEST_USER_ID)
      expect(todos).toEqual([])
    })

    it('should return all todos for user', async () => {
      await repo.create({ title: 'Todo 1' }, TEST_USER_ID)
      await repo.create({ title: 'Todo 2' }, TEST_USER_ID)

      const todos = await repo.findAll(TEST_USER_ID)
      expect(todos).toHaveLength(2)
    })

    it('should not return todos from other users', async () => {
      await repo.create({ title: 'User 1 Todo' }, TEST_USER_ID)
      await repo.create({ title: 'User 2 Todo' }, 'other-user')

      const todos = await repo.findAll(TEST_USER_ID)
      expect(todos).toHaveLength(1)
      expect(todos[0].title).toBe('User 1 Todo')
    })
  })

  describe('findById', () => {
    it('should return todo if exists', async () => {
      const created = await repo.create({ title: 'Test' }, TEST_USER_ID)
      const found = await repo.findById(created.id, TEST_USER_ID)

      expect(found).not.toBeNull()
      expect(found?.title).toBe('Test')
    })

    it('should return null if not exists', async () => {
      const found = await repo.findById(9999, TEST_USER_ID)
      expect(found).toBeNull()
    })

    it('should return null if todo belongs to other user', async () => {
      const created = await repo.create({ title: 'Test' }, 'other-user')
      const found = await repo.findById(created.id, TEST_USER_ID)
      expect(found).toBeNull()
    })
  })

  describe('update', () => {
    it('should update todo', async () => {
      const created = await repo.create({ title: 'Original' }, TEST_USER_ID)
      const updated = await repo.update(created.id, {
        title: 'Updated',
        completed: true
      }, TEST_USER_ID)

      expect(updated?.title).toBe('Updated')
      expect(updated?.completed).toBe(true)
    })

    it('should return null if todo not exists', async () => {
      const result = await repo.update(9999, { title: 'Test' }, TEST_USER_ID)
      expect(result).toBeNull()
    })

    it('should return null if todo belongs to other user', async () => {
      const created = await repo.create({ title: 'Test' }, 'other-user')
      const result = await repo.update(created.id, { title: 'Hacked' }, TEST_USER_ID)
      expect(result).toBeNull()
    })
  })

  describe('delete', () => {
    it('should delete todo and return true', async () => {
      const created = await repo.create({ title: 'To delete' }, TEST_USER_ID)
      const result = await repo.delete(created.id, TEST_USER_ID)

      expect(result).toBe(true)
      expect(await repo.findById(created.id, TEST_USER_ID)).toBeNull()
    })

    it('should return false if todo not exists', async () => {
      const result = await repo.delete(9999, TEST_USER_ID)
      expect(result).toBe(false)
    })

    it('should return false if todo belongs to other user', async () => {
      const created = await repo.create({ title: 'Test' }, 'other-user')
      const result = await repo.delete(created.id, TEST_USER_ID)
      expect(result).toBe(false)
    })
  })
})
