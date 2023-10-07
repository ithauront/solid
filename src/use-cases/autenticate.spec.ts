import { expect, test, describe } from 'vitest'
import { InMemoryUserRepository } from './in-memory/in-memory-user-repository'
import { AutenticateUseCase } from './autenticate'
import { hash } from 'bcryptjs'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'

describe('autenticate use case', () => {
  test('if autentication happens', async () => {
    const userRepository = new InMemoryUserRepository()
    const sut = new AutenticateUseCase(userRepository)

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
    const userRepository = new InMemoryUserRepository()
    const sut = new AutenticateUseCase(userRepository)

    await expect(() =>
      sut.execute({
        email: 'jhondoe@hotmail.com',
        password: 'testpassword',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  test('if try to autenticate with wrong password', async () => {
    const userRepository = new InMemoryUserRepository()
    const sut = new AutenticateUseCase(userRepository)

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
