import { FastifyInstance } from 'fastify'

import { verifyJWT } from '@/http/middlewares/verify-jwt'

import { search } from './search.controller'
import { fetchNearby } from './nearby'
import { create } from './create.controller'

export async function gymsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/gyms/search', search)
  app.get('/gyms/nearby', fetchNearby)

  app.post('/gyms', create)
}
