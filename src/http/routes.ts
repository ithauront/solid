import { FastifyInstance } from 'fastify'
import { register } from './controller/register'
import { autenticate } from './controller/autentificate'

export async function appRoutes(app: FastifyInstance) {
  app.post('/users', register)
  app.post('/sessions', autenticate)
}
