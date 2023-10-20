import { SearchGymUseCase } from '../search-gyms'
import { PrismaGymRepository } from '@/repositories/prisma/prisma-gym-repository'

export function makeSearchGymsUseCase() {
  const gymRepository = new PrismaGymRepository()
  const useCase = new SearchGymUseCase(gymRepository) // the file that need a useCase is the file that will send the dependencies as params to the useCase

  return useCase
}
