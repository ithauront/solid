import { FetchUserCheckinHistoryUseCase } from '../fetch-user-checkins-history'
import { PrismaCheckInRepository } from '@/repositories/prisma/prisma-check-in-repository'

export function makeFetchUserCheckInHistoryUseCase() {
  const prismaCheckInRepositories = new PrismaCheckInRepository()
  const useCase = new FetchUserCheckinHistoryUseCase(prismaCheckInRepositories) // the file that need a useCase is the file that will send the dependencies as params to the useCase

  return useCase
}
