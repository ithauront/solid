import { FastifyInstance } from 'fastify'

import { verifyJWT } from '../../middleware/verify-jwt'

export async function gymRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)
}
