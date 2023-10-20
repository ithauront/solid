import { PrismaGymRepository } from '@/repositories/prisma/prisma-gym-repository'
import { CheckInUseCase } from '../check-in'
import { PrismaCheckInRepository } from '@/repositories/prisma/prisma-check-in-repository'

export function makeCheckInUseCase() {
  const prismaCheckInRepositories = new PrismaCheckInRepository()
  const gymsRepository = new PrismaGymRepository()
  const useCase = new CheckInUseCase(prismaCheckInRepositories, gymsRepository) // the file that need a useCase is the file that will send the dependencies as params to the useCase

  return useCase
}
