import { describe, it, expect, beforeEach } from 'vitest'

import { InMemoryTodoRepository } from '../../infrastructure/repositories/InMemoryTodoRepository'
import { CreateTodoUseCase } from './CreateTodoUseCase'
import { GetAllTodosUseCase } from './GetAllTodosUseCase'
import { GetTodoByIdUseCase } from './GetTodoByIdUseCase'
import { UpdateTodoUseCase } from './UpdateTodoUseCase'
import { DeleteTodoUseCase } from './DeleteTodoUseCase'

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
      const todo = await createTodo.execute({ title: 'Acheter du pain' })

      expect(todo.id).toBe(1)
      expect(todo.title).toBe('Acheter du pain')
      expect(todo.completed).toBe(false)
    })

    it('should create a todo with description', async () => {
      const todo = await createTodo.execute({ 
        title: 'Courses', 
        description: 'Pain, lait, oeufs' 
      })

      expect(todo.description).toBe('Pain, lait, oeufs')
    })
  })

  describe('GetAllTodosUseCase', () => {
    it('should return empty array when no todos', async () => {
      const todos = await getAllTodos.execute()
      expect(todos).toEqual([])
    })

    it('should return all todos', async () => {
      await createTodo.execute({ title: 'Todo 1' })
      await createTodo.execute({ title: 'Todo 2' })

      const todos = await getAllTodos.execute()

      expect(todos).toHaveLength(2)
      expect(todos[0].title).toBe('Todo 1')
      expect(todos[1].title).toBe('Todo 2')
    })
  })

  describe('GetTodoByIdUseCase', () => {
    it('should return todo when found', async () => {
      const created = await createTodo.execute({ title: 'Test' })

      const found = await getTodoById.execute(created.id)

      expect(found).not.toBeNull()
      expect(found?.title).toBe('Test')
    })

    it('should return null when not found', async () => {
      const found = await getTodoById.execute(999)
      expect(found).toBeNull()
    })
  })

  describe('UpdateTodoUseCase', () => {
    it('should update todo title', async () => {
      const created = await createTodo.execute({ title: 'Original' })

      const updated = await updateTodo.execute(created.id, { title: 'Modifié' })

      expect(updated?.title).toBe('Modifié')
    })

    it('should mark todo as completed', async () => {
      const created = await createTodo.execute({ title: 'Test' })

      const updated = await updateTodo.execute(created.id, { completed: true })

      expect(updated?.completed).toBe(true)
    })

    it('should return null when todo not found', async () => {
      const result = await updateTodo.execute(999, { title: 'Test' })
      expect(result).toBeNull()
    })
  })

  describe('DeleteTodoUseCase', () => {
    it('should delete todo', async () => {
      const created = await createTodo.execute({ title: 'À supprimer' })

      const deleted = await deleteTodo.execute(created.id)

      expect(deleted).toBe(true)
      expect(await getTodoById.execute(created.id)).toBeNull()
    })

    it('should return false when todo not found', async () => {
      const result = await deleteTodo.execute(999)
      expect(result).toBe(false)
    })
  })
})
