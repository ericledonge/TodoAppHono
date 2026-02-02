import { describe, it, expect, beforeEach } from 'vitest'

import { InMemoryTodoRepository } from '../../infrastructure/repositories/InMemoryTodoRepository'
import { CreateTodoUseCase } from './CreateTodoUseCase'
import { GetAllTodosUseCase } from './GetAllTodosUseCase'
import { GetTodoByIdUseCase } from './GetTodoByIdUseCase'
import { UpdateTodoUseCase } from './UpdateTodoUseCase'
import { DeleteTodoUseCase } from './DeleteTodoUseCase'

const TEST_USER_ID = 'test-user-123'

describe('Todo Use Cases', () => {
  let repository: InMemoryTodoRepository
  let createTodo: CreateTodoUseCase
  let getAllTodos: GetAllTodosUseCase
  let getTodoById: GetTodoByIdUseCase
  let updateTodo: UpdateTodoUseCase
  let deleteTodo: DeleteTodoUseCase

  beforeEach(() => {
    repository = new InMemoryTodoRepository()
    createTodo = new CreateTodoUseCase(repository)
    getAllTodos = new GetAllTodosUseCase(repository)
    getTodoById = new GetTodoByIdUseCase(repository)
    updateTodo = new UpdateTodoUseCase(repository)
    deleteTodo = new DeleteTodoUseCase(repository)
  })

  describe('CreateTodoUseCase', () => {
    it('should create a todo', async () => {
      const todo = await createTodo.execute({ title: 'Acheter du pain' }, TEST_USER_ID)

      expect(todo.id).toBe(1)
      expect(todo.title).toBe('Acheter du pain')
      expect(todo.completed).toBe(false)
      expect(todo.userId).toBe(TEST_USER_ID)
    })

    it('should create a todo with description', async () => {
      const todo = await createTodo.execute({
        title: 'Courses',
        description: 'Pain, lait, oeufs'
      }, TEST_USER_ID)

      expect(todo.description).toBe('Pain, lait, oeufs')
    })
  })

  describe('GetAllTodosUseCase', () => {
    it('should return empty array when no todos', async () => {
      const todos = await getAllTodos.execute(TEST_USER_ID)
      expect(todos).toEqual([])
    })

    it('should return all todos for user', async () => {
      await createTodo.execute({ title: 'Todo 1' }, TEST_USER_ID)
      await createTodo.execute({ title: 'Todo 2' }, TEST_USER_ID)

      const todos = await getAllTodos.execute(TEST_USER_ID)

      expect(todos).toHaveLength(2)
      expect(todos[0].title).toBe('Todo 1')
      expect(todos[1].title).toBe('Todo 2')
    })

    it('should not return todos from other users', async () => {
      await createTodo.execute({ title: 'User 1 Todo' }, TEST_USER_ID)
      await createTodo.execute({ title: 'User 2 Todo' }, 'other-user')

      const todos = await getAllTodos.execute(TEST_USER_ID)

      expect(todos).toHaveLength(1)
      expect(todos[0].title).toBe('User 1 Todo')
    })
  })

  describe('GetTodoByIdUseCase', () => {
    it('should return todo when found', async () => {
      const created = await createTodo.execute({ title: 'Test' }, TEST_USER_ID)

      const found = await getTodoById.execute(created.id, TEST_USER_ID)

      expect(found).not.toBeNull()
      expect(found?.title).toBe('Test')
    })

    it('should return null when not found', async () => {
      const found = await getTodoById.execute(999, TEST_USER_ID)
      expect(found).toBeNull()
    })

    it('should return null when todo belongs to other user', async () => {
      const created = await createTodo.execute({ title: 'Test' }, 'other-user')

      const found = await getTodoById.execute(created.id, TEST_USER_ID)
      expect(found).toBeNull()
    })
  })

  describe('UpdateTodoUseCase', () => {
    it('should update todo title', async () => {
      const created = await createTodo.execute({ title: 'Original' }, TEST_USER_ID)

      const updated = await updateTodo.execute(created.id, { title: 'Modifie' }, TEST_USER_ID)

      expect(updated?.title).toBe('Modifie')
    })

    it('should mark todo as completed', async () => {
      const created = await createTodo.execute({ title: 'Test' }, TEST_USER_ID)

      const updated = await updateTodo.execute(created.id, { completed: true }, TEST_USER_ID)

      expect(updated?.completed).toBe(true)
    })

    it('should return null when todo not found', async () => {
      const result = await updateTodo.execute(999, { title: 'Test' }, TEST_USER_ID)
      expect(result).toBeNull()
    })

    it('should return null when todo belongs to other user', async () => {
      const created = await createTodo.execute({ title: 'Test' }, 'other-user')

      const result = await updateTodo.execute(created.id, { title: 'Hacked' }, TEST_USER_ID)
      expect(result).toBeNull()
    })
  })

  describe('DeleteTodoUseCase', () => {
    it('should delete todo', async () => {
      const created = await createTodo.execute({ title: 'A supprimer' }, TEST_USER_ID)

      const deleted = await deleteTodo.execute(created.id, TEST_USER_ID)

      expect(deleted).toBe(true)
      expect(await getTodoById.execute(created.id, TEST_USER_ID)).toBeNull()
    })

    it('should return false when todo not found', async () => {
      const result = await deleteTodo.execute(999, TEST_USER_ID)
      expect(result).toBe(false)
    })

    it('should return false when todo belongs to other user', async () => {
      const created = await createTodo.execute({ title: 'Test' }, 'other-user')

      const result = await deleteTodo.execute(created.id, TEST_USER_ID)
      expect(result).toBe(false)
    })
  })
})
