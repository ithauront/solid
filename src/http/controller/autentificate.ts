import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { makeAutenticateUseCase } from '@/use-cases/factory/make-autenticate-use-case'
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
    const autenticateUseCase = makeAutenticateUseCase()
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
