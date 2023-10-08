import { PrismaUsersRepository } from '@/repositories/prisma/PrismaUsersRepository'
import { AutenticateUseCase } from '../autenticate'

export function makeAutenticateUseCase() {
  const prismaUsersRepositories = new PrismaUsersRepository()
  const autenticateUseCase = new AutenticateUseCase(prismaUsersRepositories) // the file that need a useCase is the file that will send the dependencies as params to the useCase

  return autenticateUseCase
}
