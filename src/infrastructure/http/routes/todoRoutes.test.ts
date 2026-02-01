import { describe, it, expect, beforeEach } from 'vitest'

import app from '../../../app'
import { db } from '../../database/database'

describe('Todo Routes', () => {
  // Nettoyer la base avant chaque test
  beforeEach(() => {
    db.exec('DELETE FROM todos')
  })

  describe('GET /health', () => {
    it('should return ok', async () => {
      const res = await app.request('/health')
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json).toEqual({ status: 'ok' })
    })
  })

  describe('POST /api/todos', () => {
    it('should create a todo', async () => {
      const res = await app.request('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Acheter du pain' }),
      })
      const json = await res.json()

      expect(res.status).toBe(201)
      expect(json.id).toBeDefined()
      expect(json.title).toBe('Acheter du pain')
      expect(json.completed).toBe(false)
    })

    it('should create a todo with description', async () => {
      const res = await app.request('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: 'Courses', 
          description: 'Pain, lait, oeufs' 
        }),
      })
      const json = await res.json()

      expect(res.status).toBe(201)
      expect(json.description).toBe('Pain, lait, oeufs')
    })

    it('should return 400 if title is missing', async () => {
      const res = await app.request('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      expect(res.status).toBe(400)
    })

    it('should return 400 if title is empty', async () => {
      const res = await app.request('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '' }),
      })

      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/todos', () => {
    it('should return empty array when no todos', async () => {
      const res = await app.request('/api/todos')
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json).toEqual([])
    })

    it('should return all todos', async () => {
      // Créer des todos
      await app.request('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Todo 1' }),
      })
      await app.request('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Todo 2' }),
      })

      const res = await app.request('/api/todos')
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json).toHaveLength(2)
    })
  })

  describe('GET /api/todos/:id', () => {
    it('should return todo by id', async () => {
      // Créer un todo
      const createRes = await app.request('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test' }),
      })
      const created = await createRes.json()

      // Récupérer le todo
      const res = await app.request(`/api/todos/${created.id}`)
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.id).toBe(created.id)
      expect(json.title).toBe('Test')
    })

    it('should return 404 if todo not found', async () => {
      const res = await app.request('/api/todos/9999')

      expect(res.status).toBe(404)
    })
  })

  describe('PUT /api/todos/:id', () => {
    it('should update todo title', async () => {
      // Créer un todo
      const createRes = await app.request('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Original' }),
      })
      const created = await createRes.json()

      // Mettre à jour
      const res = await app.request(`/api/todos/${created.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Modifié' }),
      })
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.title).toBe('Modifié')
    })

    it('should mark todo as completed', async () => {
      // Créer un todo
      const createRes = await app.request('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test' }),
      })
      const created = await createRes.json()

      // Marquer comme complété
      const res = await app.request(`/api/todos/${created.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      })
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.completed).toBe(true)
    })

    it('should return 404 if todo not found', async () => {
      const res = await app.request('/api/todos/9999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test' }),
      })

      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /api/todos/:id', () => {
    it('should delete todo', async () => {
      // Créer un todo
      const createRes = await app.request('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'À supprimer' }),
      })
      const created = await createRes.json()

      // Supprimer
      const res = await app.request(`/api/todos/${created.id}`, {
        method: 'DELETE',
      })

      expect(res.status).toBe(204)

      // Vérifier qu'il n'existe plus
      const getRes = await app.request(`/api/todos/${created.id}`)
      expect(getRes.status).toBe(404)
    })

    it('should return 404 if todo not found', async () => {
      const res = await app.request('/api/todos/9999', {
        method: 'DELETE',
      })

      expect(res.status).toBe(404)
    })
  })
})
