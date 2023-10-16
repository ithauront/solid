import { expect, test, describe, beforeEach } from 'vitest'
import { InMemoryCheckInsRepository } from '../repositories/in-memory/in-memory-check-in-repository'
import { GetUserMetricsUseCase } from './get-user-metrics'

let checkInsRepository: InMemoryCheckInsRepository
let sut: GetUserMetricsUseCase

describe('get user metrics use case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    sut = new GetUserMetricsUseCase(checkInsRepository)
  })

  test('if can get checkin counts from metrics', async () => {
    await checkInsRepository.create({
      gym_id: 'gym01',
      user_id: 'user01',
    })
    await checkInsRepository.create({
      gym_id: 'gym02',
      user_id: 'user01',
    })
    const { checkInsCount } = await sut.execute({
      userId: 'user01',
    })

    expect(checkInsCount).toEqual(2)
  })
})
