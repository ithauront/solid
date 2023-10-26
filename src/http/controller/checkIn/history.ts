import { makeFetchUserCheckInHistoryUseCase } from '@/use-cases/factory/make-fetch-user-checkins-history'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function history(request: FastifyRequest, reply: FastifyReply) {
  const CheckinHitoryQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
  })

  const { page } = CheckinHitoryQuerySchema.parse(request.query)

  const fetchUserCheckInHistoryUseCase = makeFetchUserCheckInHistoryUseCase()
  const { checkIns } = await fetchUserCheckInHistoryUseCase.execute({
    userId: request.user.sub,
    page,
  })

  return reply.status(200).send({
    checkIns,
  })
}
