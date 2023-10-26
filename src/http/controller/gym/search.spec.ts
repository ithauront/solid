import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { createAndAuntenticateUser } from '@/utils/test/create-and-autenticate-user'

describe('search gyms (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })
  test('if can search  gyms', async () => {
    const { token } = await createAndAuntenticateUser(app)

    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'javascript gym',
        description: 'a gym for javascript',
        phone: '0154878954',
        latitude: -27.2892852,
        longitude: -49.6481891,
      })
    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'typescript gym',
        description: 'a gym for javascript',
        phone: '0154878954',
        latitude: -27.2892852,
        longitude: -49.6481891,
      })
    const response = await request(app.server)
      .get('/gyms/search')
      .query({ query: 'type' })
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(response.statusCode).toEqual(201)
    expect(response.body.gyms).toHaveLength(1)
    expect(response.body.gyms).toEqual([
      expect.objectContaining({ title: 'typescript gym' }),
    ])
  })
})
