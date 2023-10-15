import { expect, test, describe, beforeEach, vi } from 'vitest'
import { InMemoryCheckInsRepository } from '../repositories/in-memory/in-memory-check-in-repository'
import { FetchUserCheckinHistoryUseCase } from './fetch-user-checkins-history'

let checkInsRepository: InMemoryCheckInsRepository
let sut: FetchUserCheckinHistoryUseCase

describe('fetch user check-ins history use case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    sut = new FetchUserCheckinHistoryUseCase(checkInsRepository)
  })

  test('if can fetch check ins history', async () => {
    await checkInsRepository.create({
      gym_id: 'gym01',
      user_id: 'user01',
    })
    await checkInsRepository.create({
      gym_id: 'gym02',
      user_id: 'user01',
    })
    const { checkIns } = await sut.execute({
      userId: 'user01',
      page: 1,
    })

    expect(checkIns).toHaveLength(2)
    expect(checkIns).toEqual([
      expect.objectContaining({ gym_id: 'gym01' }),
      expect.objectContaining({ gym_id: 'gym02' }),
    ])
  })
  test('if can have 20 check ins per page', async () => {
    for (let i = 1; i <= 22; i++) {
      await checkInsRepository.create({
        gym_id: 'gym01',
        user_id: 'user01',
      })
    }

    const { checkIns } = await sut.execute({
      userId: 'user01',
      page: 2,
    })

    expect(checkIns).toHaveLength(2)
  })
})
