import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { createAndAuntenticateUser } from '@/utils/test/create-and-autenticate-user'

describe('create gym (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })
  test('if can create a gym', async () => {
    const { token } = await createAndAuntenticateUser(app, true)

    const response = await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'javascript gym',
        description: 'a gym for javascript',
        phone: '0154878954',
        latitude: -27.2892852,
        longitude: -49.6481891,
      })

    expect(response.statusCode).toEqual(201)
  })
})
