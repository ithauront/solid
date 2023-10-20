import { GetUserMetricsUseCase } from '../get-user-metrics'
import { PrismaCheckInRepository } from '@/repositories/prisma/prisma-check-in-repository'

export function makeGetUserMetricsUseCase() {
  const prismaCheckInRepositories = new PrismaCheckInRepository()
  const useCase = new GetUserMetricsUseCase(prismaCheckInRepositories) // the file that need a useCase is the file that will send the dependencies as params to the useCase

  return useCase
}
