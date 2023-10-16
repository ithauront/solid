import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gym-repository'
import { expect, test, describe, beforeEach } from 'vitest'
import { SearchGymUseCase } from './search-gyms'

let gymsRepository: InMemoryGymRepository
let sut: SearchGymUseCase

describe('search gyms use case', () => {
  beforeEach(async () => {
    gymsRepository = new InMemoryGymRepository()
    sut = new SearchGymUseCase(gymsRepository)
  })

  test('if can search gms', async () => {
    await gymsRepository.create({
      title: 'javascript gym',
      description: 'gym Description',
      phone: '0108074561',
      latitude: 27.8747279,
      longitude: -49.4889672,
    })
    await gymsRepository.create({
      title: 'typescript gym',
      description: 'gym Description',
      phone: '0108074561',
      latitude: 27.8747279,
      longitude: -49.4889672,
    })
    const { gyms } = await sut.execute({
      query: 'javascript',
      page: 1,
    })

    expect(gyms).toHaveLength(1)
    expect(gyms).toEqual([expect.objectContaining({ title: 'javascript gym' })])
  })
  test('if can have 20 gyms per page', async () => {
    for (let i = 1; i <= 22; i++) {
      await gymsRepository.create({
        title: `typescript gym${i}`,
        description: 'gym Description',
        phone: '0108074561',
        latitude: 27.8747279,
        longitude: -49.4889672,
      })
    }

    const { gyms } = await sut.execute({
      query: 'typescript',
      page: 2,
    })

    expect(gyms).toHaveLength(2)
    expect(gyms).toEqual([
      expect.objectContaining({ title: 'typescript gym21' }),
      expect.objectContaining({ title: 'typescript gym22' }),
    ])
  })
})
