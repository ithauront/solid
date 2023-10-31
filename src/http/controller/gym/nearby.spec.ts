import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { createAndAuntenticateUser } from '@/utils/test/create-and-autenticate-user'

describe('search nearby gyms (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })
  test('if can search nearby gyms', async () => {
    const { token } = await createAndAuntenticateUser(app, true)

    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'near gym',
        description: 'gym Description',
        phone: '0108074561',
        latitude: -27.2982852,
        longitude: -49.6481891,
      })
    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'far gym',
        description: 'gym Description',
        phone: '0108074561',
        latitude: 27.0610928,
        longitude: -49.5229501,
      })
    const response = await request(app.server)
      .get('/gyms/nearby')
      .query({
        latitude: -27.2982852,
        longitude: -49.6481891,
      })
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(response.statusCode).toEqual(201)
    expect(response.body.gyms).toHaveLength(1)
    expect(response.body.gyms).toEqual([
      expect.objectContaining({ title: 'near gym' }),
    ])
  })
})
