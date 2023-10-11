import { expect, test, describe, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../repositories/in-memory/in-memory-user-repository'
import { hash } from 'bcryptjs'
import { GetUserProfileUseCase } from './get-user-profile'
import { ResourceNotFoundError } from './errors/resource-not-found-erros'

let userRepository: InMemoryUserRepository
let sut: GetUserProfileUseCase

describe('get user profile use case', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    sut = new GetUserProfileUseCase(userRepository)
  })

  test('if gets user profile', async () => {
    const createdUser = await userRepository.create({
      name: 'jhon doe',
      email: 'jhondoe@hotmail.com',
      password_hash: await hash('testpassword', 6),
    })

    const { user } = await sut.execute({
      userId: createdUser.id,
    })

    expect(user.name).toEqual('jhon doe')
  })
  test('if cannot get user with wrong id', async () => {
    await expect(() =>
      sut.execute({
        userId: 'wrong id',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
