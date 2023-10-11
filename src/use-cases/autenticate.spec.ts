import { expect, test, describe, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../repositories/in-memory/in-memory-user-repository'
import { AutenticateUseCase } from './autenticate'
import { hash } from 'bcryptjs'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'

let userRepository: InMemoryUserRepository
let sut: AutenticateUseCase

describe('autenticate use case', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    sut = new AutenticateUseCase(userRepository)
  })

  test('if autentication happens', async () => {
    await userRepository.create({
      name: 'jhon doe',
      email: 'jhondoe@hotmail.com',
      password_hash: await hash('testpassword', 6),
    })

    const { user } = await sut.execute({
      email: 'jhondoe@hotmail.com',
      password: 'testpassword',
    })

    expect(user.id).toEqual(expect.any(String))
  })
  test('if try to autenticate with wrong email', async () => {
    await expect(() =>
      sut.execute({
        email: 'jhondoe@hotmail.com',
        password: 'testpassword',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  test('if try to autenticate with wrong password', async () => {
    await userRepository.create({
      name: 'jhon doe',
      email: 'jhondoe@hotmail.com',
      password_hash: await hash('testpassword', 6),
    })

    await expect(() =>
      sut.execute({
        email: 'jhondoe@hotmail.com',
        password: 'wrongPassword',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
