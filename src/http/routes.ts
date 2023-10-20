import { FastifyInstance } from 'fastify'
import { register } from './controller/register'
import { autenticate } from './controller/autentificate'
import { profile } from './controller/profile'

export async function appRoutes(app: FastifyInstance) {
  app.post('/users', register)

  app.post('/sessions', autenticate)

  /* autenticado */
  app.get('/me', profile)
}
