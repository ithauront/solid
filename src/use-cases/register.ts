import { UsersRepository } from '@/repositories/users_repository'

import { hash } from 'bcryptjs'

interface RegisterUseCaseParams {
  name: string
  email: string
  password: string
}
export class RegisterUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ name, email, password }: RegisterUseCaseParams) {
    const password_hash = await hash(password, 6)

    const userWithSameEmail = await this.usersRepository.findByEmail(email)

    if (userWithSameEmail) {
      throw new Error('Email already exists.')
    }

    await this.usersRepository.create({
      name,
      email,
      password_hash,
    })
  }
}
