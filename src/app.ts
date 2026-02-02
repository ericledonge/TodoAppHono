import { Hono } from 'hono'
import { todoRoutes } from './infrastructure/http/routes/todoRoutes'
import { auth } from './infrastructure/auth/auth'
import { authMiddleware } from './infrastructure/http/middlewares/authMiddleware'

const app = new Hono()

// Routes auth (publiques)
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

// Routes todos (protégées)
app.use('/api/todos/*', authMiddleware)
app.route('/api/todos', todoRoutes)

export default app
