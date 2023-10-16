import { Gym, Prisma } from '@prisma/client'
import { GymsRepository } from '../gyms-repository'
import { randomUUID } from 'crypto'

export class InMemoryGymRepository implements GymsRepository {
  public Itens: Gym[] = []

  async findById(id: string): Promise<Gym | null> {
    const gym = this.Itens.find((item) => item.id === id)
    if (!gym) {
      return null
    }
    return gym
  }

  async create(data: Prisma.GymCreateInput): Promise<Gym> {
    const gym = {
      id: data.id ?? randomUUID(),
      title: data.title,
      description: data.description ?? null,
      phone: data.phone ?? null,
      latitude: new Prisma.Decimal(data.latitude.toString()),
      longitude: new Prisma.Decimal(data.longitude.toString()),
      created_at: new Date(),
    }
    this.Itens.push(gym)
    return gym
  }

  async searchMany(query: string, page: number) {
    return this.Itens.filter((item) => item.title.includes(query)).slice(
      (page - 1) * 20,
      page * 20,
    )
  }
}
