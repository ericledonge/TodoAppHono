import { Hono } from 'hono'
import { todoRoutes } from './infrastructure/http/routes/todoRoutes'

const app = new Hono()

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

// Routes todos
app.route('/api/todos', todoRoutes)

export default app
