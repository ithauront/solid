import { PrismaCheckInRepository } from '@/repositories/prisma/prisma-check-in-repository'
import { ValidateCheckInUseCase } from '../validate-check-in'

export function makeValidateCheckInUseCase() {
  const prismaCheckInRepositories = new PrismaCheckInRepository()
  const useCase = new ValidateCheckInUseCase(prismaCheckInRepositories) // the file that need a useCase is the file that will send the dependencies as params to the useCase

  return useCase
}
