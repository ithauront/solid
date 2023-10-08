import { expect, test, describe, beforeEach } from 'vitest'
import { RegisterUseCase } from './register'
import { compare } from 'bcryptjs'
import { InMemoryUserRepository } from './in-memory/in-memory-user-repository'
import { UserAlreadyExistsError } from './errors/user-already-exists'

let userRepository: InMemoryUserRepository
let sut: RegisterUseCase
describe('register use case', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    sut = new RegisterUseCase(userRepository)
  })
  test('if registration happens', async () => {
    const { user } = await sut.execute({
      name: 'Jhon Doe',
      email: 'jhondoe@hotmail.com',
      password: 'testpassword',
    })

    expect(user.id).toEqual(expect.any(String))
  })

  test('if hash user password upon registration', async () => {
    const { user } = await sut.execute({
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
    const email = 'jhondoe@hotmail.com'

    await sut.execute({
      name: 'Jhon Doe',
      email,
      password: 'testpassword',
    })
    await expect(() =>
      sut.execute({
        name: 'Jhon Doe',
        email,
        password: 'testpassword',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })
})
