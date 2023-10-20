import { PrismaUsersRepository } from '@/repositories/prisma/PrismaUsersRepository'
import { GetUserProfileUseCase } from '../get-user-profile'

export function makeGetUserProfileUseCase() {
  const prismaUsersRepositories = new PrismaUsersRepository()
  const useCase = new GetUserProfileUseCase(prismaUsersRepositories) // the file that need a useCase is the file that will send the dependencies as params to the useCase

  return useCase
}
