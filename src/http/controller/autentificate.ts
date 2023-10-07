import { PrismaUsersRepository } from '@/repositories/prisma/PrismaUsersRepository'
import { AutenticateUseCase } from '@/use-cases/autenticate'
import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function autenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const autenticateBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(7),
  })

  const { email, password } = autenticateBodySchema.parse(request.body)

  try {
    const prismaUsersRepositories = new PrismaUsersRepository()
    const autenticateUseCase = new AutenticateUseCase(prismaUsersRepositories) // the file that need a useCase is the file that will send the dependencies as params to the useCase
    await autenticateUseCase.execute({
      email,
      password,
    })
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return reply.status(400).send({ message: err.message })
    }
    return reply.status(500).send() // TODO fixthis
  }

  return reply.status(200).send()
}
