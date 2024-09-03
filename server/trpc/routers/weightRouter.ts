import { z } from 'zod'
import { publicProcedure, router } from '~/server/trpc/trpc'
import { PrismaClient } from '@prisma/client';
import { createWeightSchema } from '~/schemas/createSchemas';

//* : use prisma => https://www.youtube.com/watch?v=IWu3UV8H8-0
const prisma = new PrismaClient()

export const weightRouter = router({
    getAll: publicProcedure
        .input(
            z.object({
                today: z.boolean().nullish(),
            }),
        )
        .query(async ({ input }) => {
            const date = new Date()
            const query = input.today ?  {
                where:{
                    createdAt: {
                        gte: new Date(`${date.getFullYear()}-${(date.getMonth()+1)}-${date.getDate()}`),
                    }
                }
            } : undefined
            const weights = await prisma.weight.findMany(query)
            return {
                weights,
            }
        }),
    // Mutations are the best place to do things like updating a database
    create: publicProcedure.input(createWeightSchema)
        .mutation(async (options) => {
        const { input } = options;
        try {

            prisma.$transaction([])

            const [weightResult] = await prisma
                .$transaction([
                    prisma.weight.create({
                        data: {
                            weight: input.weight,
                        }
                    }),
                ])
            return {
                weightResult,
            }
        } catch(error) {
            console.log(error)
        }
        return {
            input
        }
    }),
    delete: publicProcedure.input(
        z.object({
            weightId: z.number(),
        }),
    ).mutation(async (options) => {
        const { input } = options;
        try {
            const [weightResult] = await prisma.$transaction([
                prisma.weight.delete({ where: { id: input.weightId } }),
            ])
            return {
                weightResult
            }
        } catch(error) {
            console.log(error)
        }
        return {
            input
        }
    })
})