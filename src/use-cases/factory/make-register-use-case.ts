import { PrismaUsersRepository } from '@/repositories/prisma/PrismaUsersRepository'
import { RegisterUseCase } from '../register'

export function makeRegisterUseCase() {
  const prismaUsersRepositories = new PrismaUsersRepository()
  const registerUseCase = new RegisterUseCase(prismaUsersRepositories) // the file that need a useCase is the file that will send the dependencies as params to the useCase

  return registerUseCase
}
