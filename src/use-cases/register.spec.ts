import { expect, test, describe } from 'vitest'
import { RegisterUseCase } from './register'
import { compare } from 'bcryptjs'
import { InMemoryUserRepository } from './in-memory/in-memory-user-repository'
import { UserAlreadyExistsError } from './errors/user-already-exists'

describe('register use case', () => {
  test('if registration happens', async () => {
    const userRepository = new InMemoryUserRepository()
    const registerUseCase = new RegisterUseCase(userRepository)

    const { user } = await registerUseCase.execute({
      name: 'Jhon Doe',
      email: 'jhondoe@hotmail.com',
      password: 'testpassword',
    })

    expect(user.id).toEqual(expect.any(String))
  })

  test('if hash user password upon registration', async () => {
    const userRepository = new InMemoryUserRepository()
    const registerUseCase = new RegisterUseCase(userRepository)

    const { user } = await registerUseCase.execute({
      name: 'Jhon Doe',
      email: 'jhondoe@hotmail.com',
      password: 'testpassword',
    })

    const isPasswordCorectlyHashed = await compare(
      'testpassword',
      user.password_hash,
    )
    expect(isPasswordCorectlyHashed).toBe(true)
  })
  test('if user cannot use the same email', async () => {
    const userRepository = new InMemoryUserRepository()
    const registerUseCase = new RegisterUseCase(userRepository)
    const email = 'jhondoe@hotmail.com'

    await registerUseCase.execute({
      name: 'Jhon Doe',
      email,
      password: 'testpassword',
    })
    await expect(() =>
      registerUseCase.execute({
        name: 'Jhon Doe',
        email,
        password: 'testpassword',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })
})
