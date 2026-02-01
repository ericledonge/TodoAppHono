import type { ITodoRepository } from '../../domain/repositories/ITodoRepository'
import type { Todo, UpdateTodoInput } from '../../domain/entities/Todo'

export class UpdateTodoUseCase {
  constructor(private todoRepository: ITodoRepository) {}

  async execute(id: number, input: UpdateTodoInput): Promise<Todo | null> {
    return this.todoRepository.update(id, input)
  }
}