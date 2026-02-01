import type { ITodoRepository } from '../../domain/repositories/ITodoRepository'
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../../domain/entities/Todo'

export class InMemoryTodoRepository implements ITodoRepository {
  private todos: Todo[] = []
  private nextId = 1

  async findAll(): Promise<Todo[]> {
    return [...this.todos]
  }

  async findById(id: number): Promise<Todo | null> {
    return this.todos.find(todo => todo.id === id) ?? null
  }

  async create(input: CreateTodoInput): Promise<Todo> {
    const todo: Todo = {
      id: this.nextId++,
      title: input.title,
      description: input.description ?? null,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.todos.push(todo)
    return todo
  }

  async update(id: number, input: UpdateTodoInput): Promise<Todo | null> {
    const index = this.todos.findIndex(todo => todo.id === id)
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

  async delete(id: number): Promise<boolean> {
    const index = this.todos.findIndex(todo => todo.id === id)
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
