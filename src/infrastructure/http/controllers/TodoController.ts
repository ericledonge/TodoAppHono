import type { Context } from 'hono'

import { CreateTodoUseCase } from '../../../application/use-cases/CreateTodoUseCase'
import { GetAllTodosUseCase } from '../../../application/use-cases/GetAllTodosUseCase'
import { GetTodoByIdUseCase } from '../../../application/use-cases/GetTodoByIdUseCase'
import { UpdateTodoUseCase } from '../../../application/use-cases/UpdateTodoUseCase'
import { DeleteTodoUseCase } from '../../../application/use-cases/DeleteTodoUseCase'
import type { ITodoRepository } from '../../../domain/repositories/ITodoRepository'

export class TodoController {
  private createTodoUseCase: CreateTodoUseCase
  private getAllTodosUseCase: GetAllTodosUseCase
  private getTodoByIdUseCase: GetTodoByIdUseCase
  private updateTodoUseCase: UpdateTodoUseCase
  private deleteTodoUseCase: DeleteTodoUseCase

  constructor(todoRepository: ITodoRepository) {
    this.createTodoUseCase = new CreateTodoUseCase(todoRepository)
    this.getAllTodosUseCase = new GetAllTodosUseCase(todoRepository)
    this.getTodoByIdUseCase = new GetTodoByIdUseCase(todoRepository)
    this.updateTodoUseCase = new UpdateTodoUseCase(todoRepository)
    this.deleteTodoUseCase = new DeleteTodoUseCase(todoRepository)
  }

  private getUserId(c: Context): string {
    const user = c.get('user') as { id: string }
    return user.id
  }

  async getAll(c: Context) {
    const userId = this.getUserId(c)
    const todos = await this.getAllTodosUseCase.execute(userId)

    return c.json(todos)
  }

  async getById(c: Context) {
    const userId = this.getUserId(c)
    const id = Number(c.req.param('id'))
    const todo = await this.getTodoByIdUseCase.execute(id, userId)

    if (!todo) {
      return c.json({ error: 'Todo not found' }, 404)
    }

    return c.json(todo)
  }

  async create(c: Context) {
    const userId = this.getUserId(c)
    const body = await c.req.json()
    const todo = await this.createTodoUseCase.execute(body, userId)

    return c.json(todo, 201)
  }

  async update(c: Context) {
    const userId = this.getUserId(c)
    const id = Number(c.req.param('id'))
    const body = await c.req.json()
    const todo = await this.updateTodoUseCase.execute(id, body, userId)

    if (!todo) {
      return c.json({ error: 'Todo not found' }, 404)
    }

    return c.json(todo)
  }

  async delete(c: Context) {
    const userId = this.getUserId(c)
    const id = Number(c.req.param('id'))
    const deleted = await this.deleteTodoUseCase.execute(id, userId)

    if (!deleted) {
      return c.json({ error: 'Todo not found' }, 404)
    }

    return c.body(null, 204)
  }
}
