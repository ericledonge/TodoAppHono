import { Todo, CreateTodoInput, UpdateTodoInput } from '../entities/Todo'

export interface ITodoRepository {
  findAll(): Promise<Todo[]>
  findById(id: number): Promise<Todo | null>
  create(input: CreateTodoInput): Promise<Todo>
  update(id: number, input: UpdateTodoInput): Promise<Todo | null>
  delete(id: number): Promise<boolean>
}