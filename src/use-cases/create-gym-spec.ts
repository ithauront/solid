import { expect, test, describe, beforeEach } from 'vitest'
import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gym-repository'
import { CreateGymUseCase } from './create-gym'

let gymRepository: InMemoryGymRepository
let sut: CreateGymUseCase
describe('create gym use case', () => {
  beforeEach(() => {
    gymRepository = new InMemoryGymRepository()
    sut = new CreateGymUseCase(gymRepository)
  })
  test('if creation happens', async () => {
    const { gym } = await sut.execute({
      title: 'gym01',
      description: 'gym Description',
      phone: '0108074561',
      latitude: 27.8747279,
      longitude: -49.4889672,
    })

    expect(gym.id).toEqual(expect.any(String))
  })
})
