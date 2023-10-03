import { expect, test, describe } from 'vitest'
import { RegisterUseCase } from './register'
import { compare } from 'bcryptjs'

describe('register use case', () => {
  test('if hash user password upon registration', async () => {
    const registerUseCase = new RegisterUseCase({
      async findByEmail(email) {
        return null
      },
      async create(data) {
        return {
          id: '145781475',
          name: data.name,
          email: data.email,
          password_hash: data.password_hash,
          created_at: new Date(),
        }
      },
    })

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
})
