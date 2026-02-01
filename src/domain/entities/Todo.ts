export interface Todo {
    id: number
    title: string
    description: string | null
    completed: boolean
    createdAt: Date
    updatedAt: Date
  }
  
  export interface CreateTodoInput {
    title: string
    description?: string
  }
  
  export interface UpdateTodoInput {
    title?: string
    description?: string
    completed?: boolean
  }