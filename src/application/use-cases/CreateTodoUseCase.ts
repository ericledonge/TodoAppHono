import type { ITodoRepository } from '../../domain/repositories/ITodoRepository'
import type { Todo, CreateTodoInput } from '../../domain/entities/Todo'

export class CreateTodoUseCase {
  constructor(private todoRepository: ITodoRepository) {}

  async execute(input: CreateTodoInput): Promise<Todo> {
    return this.todoRepository.create(input)
  }
}