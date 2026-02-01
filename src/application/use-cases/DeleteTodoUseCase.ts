import type { ITodoRepository } from '../../domain/repositories/ITodoRepository'

export class DeleteTodoUseCase {
  constructor(private todoRepository: ITodoRepository) {}

  async execute(id: number): Promise<boolean> {
    return this.todoRepository.delete(id)
  }
}