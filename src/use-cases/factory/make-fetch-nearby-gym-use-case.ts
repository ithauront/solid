import { FetchNearbyGymsUseCase } from '../fetch-nearby-gyms'
import { PrismaGymRepository } from '@/repositories/prisma/prisma-gym-repository'

export function makeFetchNearbyGymsUseCase() {
  const gymRepository = new PrismaGymRepository()
  const useCase = new FetchNearbyGymsUseCase(gymRepository) // the file that need a useCase is the file that will send the dependencies as params to the useCase

  return useCase
}
