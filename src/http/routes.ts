import { FastifyInstance } from 'fastify'

import { verifyJWT } from './middlewares/verify-jwt'

import { register } from './controllers/register.controller'
import { authenticate } from './controllers/authenticate.controller'
import { profile } from './controllers/profile.controller'

export async function appRoutes(app: FastifyInstance) {
  app.post('/users', register)
  app.post('/sessions', authenticate)

  app.get('/me', { onRequest: [verifyJWT] }, profile)
}
