import { FastifyInstance } from 'fastify'
import { register } from './register'
import { autenticate } from './autentificate'
import { profile } from './profile'
import { verifyJWT } from '../../middleware/verify-jwt'
import { refresh } from './refresh'

export async function userRoutes(app: FastifyInstance) {
  app.post('/users', register)

  app.post('/sessions', autenticate)

  app.patch('/token/refresh', refresh)

  /* autenticado */
  app.get('/me', { onRequest: [verifyJWT] }, profile)
}
