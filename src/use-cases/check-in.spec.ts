import { expect, test, describe, beforeEach, vi, afterEach } from 'vitest'
import { InMemoryCheckInsRepository } from '../repositories/in-memory/in-memory-check-in-repository'
import { CheckInUseCase } from './check-in'
import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gym-repository'
import { Decimal } from '@prisma/client/runtime/library'

let checkInsRepository: InMemoryCheckInsRepository
let gymRepository: InMemoryGymRepository
let sut: CheckInUseCase
describe('check-in use case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymRepository = new InMemoryGymRepository()
    sut = new CheckInUseCase(checkInsRepository, gymRepository)
    await gymRepository.create({
      id: 'gym01',
      title: 'academiaTeste',
      description: 'a melhor academia',
      phone: '',
      latitude: 0,
      longitude: 0,
    })

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
      userLatitude: 0,
      userLongitude: 0,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  test('if cannot make check in twice in a day', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))
    await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
      userLatitude: 0,
      userLongitude: 0,
    })

    await expect(() =>
      sut.execute({
        gymId: 'gym01',
        userId: 'user01',
        userLatitude: 0,
        userLongitude: 0,
      }),
    ).rejects.toBeInstanceOf(Error)
  })
  test('if cannot make check in in different days', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))
    await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
      userLatitude: 0,
      userLongitude: 0,
    })

    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0))
    const { checkIn } = await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
      userLatitude: 0,
      userLongitude: 0,
    })
    expect(checkIn.id).toEqual(expect.any(String))
  })
  test('if cannot check in distant gym', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))
    gymRepository.Itens.push({
      id: 'gym02',
      title: 'academiaTeste',
      description: 'a melhor academia',
      phone: '',
      latitude: new Decimal(-27.8747279),
      longitude: new Decimal(-49.4889672),
    })

    await expect(() =>
      sut.execute({
        gymId: 'gym01',
        userId: 'user01',
        userLatitude: -27.2982852,
        userLongitude: -49.6481891,
      }),
    ).rejects.toBeInstanceOf(Error)
  })
})
