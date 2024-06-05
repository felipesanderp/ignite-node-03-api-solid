import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { verifyUserRole } from '@/http/middlewares/verify-user-role'

import { search } from './search.controller'
import { fetchNearby } from './nearby.controller'
import { create } from './create.controller'

export async function gymsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.withTypeProvider<ZodTypeProvider>().get(
    '/gyms/search',
    {
      schema: {
        tags: ['Gym'],
        summary: 'Search gym',
        security: [{ bearerAuth: [] }],
        params: z.object({
          q: z.string(),
          page: z.coerce.number().min(1).default(1),
        }),
        response: {
          200: z.object({
            id: z.string().uuid(),
            title: z.string(),
            description: z.string().nullable(),
            phone: z.string().nullable(),
            latitude: z.number(),
            longitude: z.number(),
          }),
        },
      },
    },
    search,
  )

  app.withTypeProvider<ZodTypeProvider>().get(
    '/gyms/nearby',
    {
      schema: {
        tags: ['Gym'],
        summary: 'Get nearby gyms',
        security: [{ bearerAuth: [] }],
        querystring: z.object({
          latitude: z.number(),
          longitude: z.number(),
        }),
        response: {
          200: z.object({
            id: z.string().uuid(),
            title: z.string(),
            description: z.string().nullable(),
            phone: z.string().nullable(),
            latitude: z.number(),
            longitude: z.number(),
          }),
        },
      },
    },
    fetchNearby,
  )

  app.withTypeProvider<ZodTypeProvider>().post(
    '/gyms',
    {
      onRequest: [verifyUserRole('ADMIN')],
      schema: {
        tags: ['Gym'],
        summary: 'Create Gym (Only ADMINS)',
        security: [{ bearerAuth: [] }],
        body: z.object({
          title: z.string(),
          description: z.string().nullable(),
          phone: z.string().nullable(),
          latitude: z.number(),
          longitude: z.number(),
        }),
        response: {
          201: z.null(),
          401: z.object({
            message: z.string(),
          }),
        },
      },
    },
    create,
  )
}
