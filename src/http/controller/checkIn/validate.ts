import { makeValidateCheckInUseCase } from '@/use-cases/factory/make-validate-check-in'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function validate(request: FastifyRequest, reply: FastifyReply) {
  const validateCheckInParmsSchema = z.object({
    checkInId: z.string().uuid(),
  })

  const { checkInId } = validateCheckInParmsSchema.parse(request.params)

  const validateCheckInUseCase = makeValidateCheckInUseCase()
  await validateCheckInUseCase.execute({
    checkInID: checkInId,
  })

  return reply.status(204).send()
}
