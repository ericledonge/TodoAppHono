import { betterAuth } from "better-auth"
import { db } from "../database/database"

export const auth = betterAuth({
  database: db,
  baseURL: process.env.BETTER_AUTH_BASE_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
  },
})