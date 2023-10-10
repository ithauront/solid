import { expect, test, describe, beforeEach } from 'vitest'
import { InMemoryCheckInsRepository } from './in-memory/in-memory-check-in-repository'
import { CheckInUseCase } from './check-in'

let checkInsRepository: InMemoryCheckInsRepository
let sut: CheckInUseCase
describe('check-in use case', () => {
  beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository()
    sut = new CheckInUseCase(checkInsRepository)
  })
  test('if can check in', async () => {
    const { checkIn } = await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })
})
