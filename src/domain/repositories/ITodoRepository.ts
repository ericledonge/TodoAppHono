import { Todo, CreateTodoInput, UpdateTodoInput } from '../entities/Todo'

export interface ITodoRepository {
  findAll(userId: string): Promise<Todo[]>
  findById(id: number, userId: string): Promise<Todo | null>
  create(input: CreateTodoInput, userId: string): Promise<Todo>
  update(id: number, input: UpdateTodoInput, userId: string): Promise<Todo | null>
  delete(id: number, userId: string): Promise<boolean>
}