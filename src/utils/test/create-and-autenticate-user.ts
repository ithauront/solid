import { FastifyInstance } from 'fastify'
import request from 'supertest'

export async function createAndAuntenticateUser(app: FastifyInstance) {
  await request(app.server).post('/users').send({
    name: 'Jhon Doe',
    email: 'jhondoe@example.com',
    password: 'testpassword',
  })
  const authResponse = await request(app.server).post('/sessions').send({
    email: 'jhondoe@example.com',
    password: 'testpassword',
  })
  const { token } = authResponse.body

  return token
}
