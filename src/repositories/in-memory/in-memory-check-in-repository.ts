import { CheckInRepository } from '@/repositories/check-ins-repository'
import { CheckIn, Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import { randomUUID } from 'node:crypto'

export class InMemoryCheckInsRepository implements CheckInRepository {
  public Itens: CheckIn[] = []
  async findByUserIdOnDate(
    userId: string,
    date: Date,
  ): Promise<CheckIn | null> {
    const startOfDay = dayjs(date).startOf('date')
    const endOfDay = dayjs(date).endOf('date')

    const checkInOnSameDate = this.Itens.find((checkIn) => {
      const checkInDate = dayjs(checkIn.created_at)
      const isOnSameDate =
        checkInDate.isAfter(startOfDay) && checkInDate.isBefore(endOfDay)

      return checkIn.user_id === userId && isOnSameDate
    })
    if (!checkInOnSameDate) {
      return null
    }
    return checkInOnSameDate
  }

  async create(data: Prisma.CheckInUncheckedCreateInput): Promise<CheckIn> {
    const checkIn = {
      id: randomUUID(),
      user_id: data.user_id,
      gym_id: data.gym_id,
      validated_at: data.validated_at ? new Date(data.validated_at) : null,
      created_at: new Date(),
    }
    this.Itens.push(checkIn)
    return checkIn
  }

  async countByUserId(userId: string): Promise<number> {
    return this.Itens.filter((item) => item.user_id === userId).length
  }

  async findManyByUserId(userId: string, page: number): Promise<CheckIn[]> {
    return this.Itens.filter((item) => item.user_id === userId).slice(
      (page - 1) * 20,
      page * 20,
    )
  }

  async findCheckinById(id: string) {
    const checkIn = this.Itens.find((item) => item.id === id)
    if (!checkIn) {
      return null
    }
    return checkIn
  }

  async save(checkIn: CheckIn) {
    const checkInIndex = this.Itens.findIndex((item) => item.id === checkIn.id)
    if (checkInIndex >= 0) {
      this.Itens[checkInIndex] = checkIn
    }
    return checkIn
  }
}
