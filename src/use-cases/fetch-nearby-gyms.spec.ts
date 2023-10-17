import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gym-repository'
import { expect, test, describe, beforeEach } from 'vitest'

import { FetchNearbyGymsUseCase } from './fetch-nearby-gyms'

let gymsRepository: InMemoryGymRepository
let sut: FetchNearbyGymsUseCase

describe('fetch nearby gyms use case', () => {
  beforeEach(async () => {
    gymsRepository = new InMemoryGymRepository()
    sut = new FetchNearbyGymsUseCase(gymsRepository)
  })

  test('if can find nearby gyms', async () => {
    await gymsRepository.create({
      title: 'near gym',
      description: 'gym Description',
      phone: '0108074561',
      latitude: -27.2982852,
      longitude: -49.6481891,
    })
    await gymsRepository.create({
      title: 'far gym',
      description: 'gym Description',
      phone: '0108074561',
      latitude: 27.0610928,
      longitude: -49.5229501,
    })
    const { gyms } = await sut.execute({
      userLatitude: -27.2982852,
      userLongitude: -49.6481891,
    })

    expect(gyms).toHaveLength(1)
    expect(gyms).toEqual([expect.objectContaining({ title: 'near gym' })])
  })
})
