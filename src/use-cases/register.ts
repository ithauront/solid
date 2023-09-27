import { prisma } from '@/lib/prisma'
import { PrismaUsersRepositories } from '@/repositories/prisma-user-repositories'
import { hash } from 'bcryptjs'

interface RegisterUseCaseParams {
  name: string
  email: string
  password: string
}

export async function registerUseCase({
  name,
  email,
  password,
}: RegisterUseCaseParams) {
  const password_hash = await hash(password, 6)

  const userWithSameEmail = await prisma.user.findUnique({
    where: { email },
  })
  if (userWithSameEmail) {
    throw new Error('Email already exists.')
  }

  const prismaUsersRepositories = new PrismaUsersRepositories()

  await prismaUsersRepositories.create({
    name,
    email,
    password_hash,
  })
}
