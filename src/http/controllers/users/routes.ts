import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { verifyJWT } from '@/http/middlewares/verify-jwt'

import { register } from './register.controller'
import { authenticate } from './authenticate.controller'
import { profile } from './profile.controller'
import { refresh } from './refresh.controller'

export async function userRoutes(app: FastifyInstance) {
  app.post('/users', register)
  app.post('/sessions', authenticate)

  app.patch('/token/refresh', refresh)

  app.withTypeProvider<ZodTypeProvider>().get(
    '/me',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['User'],
        summary: 'Get personal profile',
        response: {
          200: z.object({
            user: z.object({
              id: z.string().uuid(),
              name: z.string(),
              email: z.string().email(),
              role: z.union([z.literal('ADMIN'), z.literal('MEMBER')]),
            }),
          }),
        },
      },
    },
    profile,
  )
}
