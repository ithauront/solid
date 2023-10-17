import { expect, test, describe, beforeEach, vi, afterEach } from 'vitest'
import { InMemoryCheckInsRepository } from '../repositories/in-memory/in-memory-check-in-repository'
import { ValidateCheckInUseCase } from './validate-check-in'
import { ResourceNotFoundError } from './errors/resource-not-found-erros'

let checkInsRepository: InMemoryCheckInsRepository
let sut: ValidateCheckInUseCase

describe('validate check-in use case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    sut = new ValidateCheckInUseCase(checkInsRepository)

    //   vi.useFakeTimers()
  })
  afterEach(() => {
    //   vi.useRealTimers()
  })
  test('if can validate check in', async () => {
    const createdCheckIn = await checkInsRepository.create({
      gym_id: 'gym01',
      user_id: 'user01',
    })
    const { checkIn } = await sut.execute({
      checkInID: createdCheckIn.id,
    })

    expect(checkIn.validated_at).toEqual(expect.any(Date))
    expect(checkInsRepository.Itens[0].validated_at).toEqual(expect.any(Date))
  })

  test('if cannot validate an inexistent checkin', async () => {
    await expect(() =>
      sut.execute({
        checkInID: 'inexistent-checkin-id',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
