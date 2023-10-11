import { Gym } from '@prisma/client'
import { GymsRepository } from '../gyms-repository'

export class InMemoryGymRepository implements GymsRepository {
  public Itens: Gym[] = []

  async findById(id: string): Promise<Gym | null> {
    const gym = this.Itens.find((item) => item.id === id)
    if (!gym) {
      return null
    }
    return gym
  }
}
