import { makeCheckInUseCase } from '@/use-cases/factory/make-check-in-use-case'
import { makeCreateGymUseCase } from '@/use-cases/factory/make-create-gym-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createCheckinParmsSchema = z.object({
    gymId: z.string().uuid(),
  })
  const createCheckinBodySchema = z.object({
    latitude: z.number().refine((value) => {
      return Math.abs(value) <= 90
    }),
    longitude: z.number().refine((value) => {
      return Math.abs(value) <= 180
    }),
  })

  const { latitude, longitude } = createCheckinBodySchema.parse(request.body)
  const { gymId } = createCheckinParmsSchema.parse(request.params)

  const createCheckInUseCase = makeCheckInUseCase()
  await createCheckInUseCase.execute({
    gymId,
    userId: request.user.sub,
    userLatitude: latitude,
    userLongitude: longitude,
  })

  return reply.status(201).send()
}
