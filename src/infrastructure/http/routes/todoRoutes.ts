import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

import { TodoController } from '../controllers/TodoController'
import { SqliteTodoRepository } from '../../repositories/SqliteTodoRepository'

// Schémas de validation Zod
const createTodoSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200),
  description: z.string().optional(),
})

const updateTodoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
})

// Créer le repository et le controller
const todoRepository = new SqliteTodoRepository()
const todoController = new TodoController(todoRepository)

// Créer les routes
export const todoRoutes = new Hono()

todoRoutes.get('/', (c) => todoController.getAll(c))

todoRoutes.get('/:id', (c) => todoController.getById(c))

todoRoutes.post('/', zValidator('json', createTodoSchema), (c) => todoController.create(c))

todoRoutes.put('/:id', zValidator('json', updateTodoSchema), (c) => todoController.update(c))

todoRoutes.delete('/:id', (c) => todoController.delete(c))
