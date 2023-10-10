import { expect, test, describe, beforeEach, vi, afterEach } from 'vitest'
import { InMemoryCheckInsRepository } from './in-memory/in-memory-check-in-repository'
import { CheckInUseCase } from './check-in'

let checkInsRepository: InMemoryCheckInsRepository
let sut: CheckInUseCase
describe('check-in use case', () => {
  beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository()
    sut = new CheckInUseCase(checkInsRepository)

    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })
  test('if can check in', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))
    const { checkIn } = await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  test('if cannot make check in twice in a day', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))
    await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
    })

    await expect(() =>
      sut.execute({
        gymId: 'gym01',
        userId: 'user01',
      }),
    ).rejects.toBeInstanceOf(Error)
  })
  test('if cannot make check in in different days', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))
    await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
    })

    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0))
    const { checkIn } = await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
    })
    expect(checkIn.id).toEqual(expect.any(String))
  })
})
