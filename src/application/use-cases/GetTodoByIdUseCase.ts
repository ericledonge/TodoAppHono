import type { ITodoRepository } from '../../domain/repositories/ITodoRepository'
import type { Todo } from '../../domain/entities/Todo'

export class GetTodoByIdUseCase {
  constructor(private todoRepository: ITodoRepository) {}

  async execute(id: number): Promise<Todo | null> {
    return this.todoRepository.findById(id)
  }
}