import { PrismaUsersRepository } from '@/repositories/prisma/PrismaUsersRepository'
import { UserAlreadyExistsError } from '@/use-cases/errors/user-already-exists'
import { RegisterUseCase } from '@/use-cases/register'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(7),
  })

  const { name, email, password } = registerBodySchema.parse(request.body)

  try {
    const prismaUsersRepositories = new PrismaUsersRepository()
    const registerUseCase = new RegisterUseCase(prismaUsersRepositories) // the file that need a useCase is the file that will send the dependencies as params to the useCase
    await registerUseCase.execute({
      name,
      email,
      password,
    })
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: err.message })
    }
    return reply.status(500).send() // TODO fixthis
  }

  return reply.status(201).send()
}
