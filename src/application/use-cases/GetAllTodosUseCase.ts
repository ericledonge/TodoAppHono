import type { ITodoRepository } from '../../domain/repositories/ITodoRepository'
import type { Todo } from '../../domain/entities/Todo'

export class GetAllTodosUseCase {
  constructor(private todoRepository: ITodoRepository) {}

  async execute(userId: string): Promise<Todo[]> {
    return this.todoRepository.findAll(userId)
  }
}