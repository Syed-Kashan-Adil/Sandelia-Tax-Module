import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export default signInSchema
