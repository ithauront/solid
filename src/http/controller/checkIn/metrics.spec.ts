import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { createAndAuntenticateUser } from '@/utils/test/create-and-autenticate-user'
import { prisma } from '@/lib/prisma'

describe('check-in metrics (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })
  test('if can get a count of check-ins', async () => {
    const { token } = await createAndAuntenticateUser(app)

    const gym = await prisma.gym.create({
      data: {
        title: 'javascript gym',
        latitude: -27.2892852,
        longitude: -49.6481891,
      },
    })

    const user = await prisma.user.findFirstOrThrow()

    await prisma.checkIn.createMany({
      data: [
        {
          gym_id: gym.id,
          user_id: user.id,
        },
        {
          gym_id: gym.id,
          user_id: user.id,
        },
      ],
    })

    const response = await request(app.server)
      .get('/check-ins/metrics')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.checkInsCount).toEqual(2)
  })
})
