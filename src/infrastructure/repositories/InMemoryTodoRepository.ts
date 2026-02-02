import type { ITodoRepository } from '../../domain/repositories/ITodoRepository'
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../../domain/entities/Todo'

export class InMemoryTodoRepository implements ITodoRepository {
  private todos: Todo[] = []
  private nextId = 1

  async findAll(userId: string): Promise<Todo[]> {
    return this.todos.filter(todo => todo.userId === userId)
  }

  async findById(id: number, userId: string): Promise<Todo | null> {
    return this.todos.find(todo => todo.id === id && todo.userId === userId) ?? null
  }

  async create(input: CreateTodoInput, userId: string): Promise<Todo> {
    const todo: Todo = {
      id: this.nextId++,
      title: input.title,
      description: input.description ?? null,
      completed: false,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.todos.push(todo)
    return todo
  }

  async update(id: number, input: UpdateTodoInput, userId: string): Promise<Todo | null> {
    const index = this.todos.findIndex(todo => todo.id === id && todo.userId === userId)
    if (index === -1) return null

    const existing = this.todos[index]
    const updated: Todo = {
      ...existing,
      title: input.title ?? existing.title,
      description: input.description !== undefined ? input.description : existing.description,
      completed: input.completed ?? existing.completed,
      updatedAt: new Date(),
    }
    this.todos[index] = updated
    return updated
  }

  async delete(id: number, userId: string): Promise<boolean> {
    const index = this.todos.findIndex(todo => todo.id === id && todo.userId === userId)
    if (index === -1) return false
    this.todos.splice(index, 1)
    return true
  }

  // Utilitaire pour les tests
  clear(): void {
    this.todos = []
    this.nextId = 1
  }
}
