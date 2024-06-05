import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { verifyUserRole } from '@/http/middlewares/verify-user-role'

import { create } from './create.controller'
import { validate } from './validate.controller'
import { history } from './history.controller'
import { metrics } from './metrics.controller'

export async function checkInsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.withTypeProvider<ZodTypeProvider>().get(
    '/check-ins/history',
    {
      schema: {
        tags: ['Check-in'],
        summary: 'Return logged user check-ins history',
        security: [{ bearerAuth: [] }],
        querystring: z.object({
          page: z.coerce.number().min(1).default(1),
        }),
        response: {
          200: z.object({
            checkIns: z.object({
              id: z.string().uuid(),
              created_at: z.date(),
              validated_at: z.date().nullable(),
              user_id: z.string().uuid(),
              gym_id: z.string().uuid(),
            }),
          }),
        },
      },
    },
    history,
  )

  app.withTypeProvider<ZodTypeProvider>().get(
    '/check-ins/metrics',
    {
      schema: {
        tags: ['Check-in'],
        summary: 'Return logged user check-ins count',
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            checkInsCount: z.number(),
          }),
        },
      },
    },
    metrics,
  )

  app.withTypeProvider<ZodTypeProvider>().post(
    '/gyms/:gymId/check-ins',
    {
      schema: {
        tags: ['Check-in'],
        summary: 'Create a check-in',
        security: [{ bearerAuth: [] }],
        params: z.object({
          gymId: z.string().uuid(),
        }),
        body: z.object({
          latitude: z.number(),
          longitude: z.number(),
        }),
        response: {
          201: z.null(),
        },
      },
    },
    create,
  )

  app.withTypeProvider<ZodTypeProvider>().patch(
    '/check-ins/:checkInId/validate',
    {
      onRequest: [verifyUserRole('ADMIN')],
      schema: {
        tags: ['Check-in'],
        summary: 'Validate user check-in (Only ADMIN)',
        security: [{ bearerAuth: [] }],
        params: z.object({
          checkInId: z.string().uuid(),
        }),
        response: {
          204: z.null(),
          401: z.object({
            message: z.string(),
          }),
        },
      },
    },
    validate,
  )
}
