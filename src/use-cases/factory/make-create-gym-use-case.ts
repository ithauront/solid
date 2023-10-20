import { CreateGymUseCase } from '../create-gym'
import { PrismaGymRepository } from '@/repositories/prisma/prisma-gym-repository'

export function makeCreateGymUseCase() {
  const gymRepository = new PrismaGymRepository()
  const useCase = new CreateGymUseCase(gymRepository) // the file that need a useCase is the file that will send the dependencies as params to the useCase

  return useCase
}
