import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { verifyJWT } from '@/http/middlewares/verify-jwt'

import { register } from './register.controller'
import { authenticate } from './authenticate.controller'
import { profile } from './profile.controller'
import { refresh } from './refresh.controller'

export async function userRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Create Account',
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string().min(6),
        }),
        response: {
          201: z.null(),
        },
      },
    },
    register,
  )

  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate with e-mail & password',
        body: z.object({
          email: z.string().email(),
          password: z.string(),
        }),
        response: {
          200: z.object({
            token: z.string(),
          }),
        },
      },
    },
    authenticate,
  )

  app.patch(
    '/token/refresh',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Refresh token',
        response: {
          200: z.object({
            token: z.string(),
          }),
        },
      },
    },
    refresh,
  )

  app.withTypeProvider<ZodTypeProvider>().get(
    '/me',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['User'],
        summary: 'Get personal profile',
        security: [{ bearerAuth: [] }],
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
