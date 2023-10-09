import { UsersRepository } from '@/repositories/users_repository'
import { Prisma, User } from '@prisma/client'

export class InMemoryUserRepository implements UsersRepository {
  public Itens: User[] = []

  async findById(id: string): Promise<User | null> {
    const user = this.Itens.find((item) => item.id === id)
    if (!user) {
      return null
    }
    return user
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.Itens.find((item) => item.email === email)
    if (!user) {
      return null
    }
    return user
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user = {
      id: '145781475',
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      created_at: new Date(),
    }
    this.Itens.push(user)
    return user
  }
}
