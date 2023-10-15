import { CheckIn } from '@prisma/client'
import { CheckInRepository } from '@/repositories/check-ins-repository'

interface FetchUserCheckinHistoryUseCaseRequest {
  userId: string
  page: number
}
interface FetchUserCheckinHistoryUseCaseResponse {
  checkIns: CheckIn[]
}
export class FetchUserCheckinHistoryUseCase {
  constructor(private checkInRepository: CheckInRepository) {}

  async execute({
    userId,
    page,
  }: FetchUserCheckinHistoryUseCaseRequest): Promise<FetchUserCheckinHistoryUseCaseResponse> {
    const checkIns = await this.checkInRepository.findManyByUserId(userId, page)

    return { checkIns }
  }
}
