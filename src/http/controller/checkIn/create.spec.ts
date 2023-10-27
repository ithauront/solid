import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { createAndAuntenticateUser } from '@/utils/test/create-and-autenticate-user'
import { prisma } from '@/lib/prisma'

describe('create check-in (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })
  test('if can create a check-in', async () => {
    const { token } = await createAndAuntenticateUser(app)

    const gym = await prisma.gym.create({
      data: {
        title: 'javascript gym',
        latitude: -27.2892852,
        longitude: -49.6481891,
      },
    })

    const response = await request(app.server)
      .post(`/gyms/${gym.id}/check-ins`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        latitude: -27.2892852,
        longitude: -49.6481891,
      })

    expect(response.statusCode).toEqual(201)
  })
})
