import { z } from 'zod'
import { publicProcedure, router } from '~/server/trpc/trpc'
import { PrismaClient } from '@prisma/client';
import { createFatPercentageSchema } from '~/schemas/createSchemas';

//* : use prisma => https://www.youtube.com/watch?v=IWu3UV8H8-0
const prisma = new PrismaClient()

export const fatPrecentageRouter = router({
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
            const fatPercentages = await prisma.fatPercentage.findMany(query)
            return {
                fatPercentages
            }
        }),
    // Mutations are the best place to do things like updating a database
    create: publicProcedure.input(createFatPercentageSchema)
        .mutation(async (options) => {
        const { input } = options;
        try {
            const [fatPercentageResult] = await prisma
                .$transaction([
                    prisma.fatPercentage.create({
                        data: {
                            fatPercentage: input.fatPercentage,
                        }
                    }),
                ])
            return {
                fatPercentageResult,
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
            fatPercentageId: z.number(),
        }),
    ).mutation(async (options) => {
        const { input } = options;
        try {
            const [fatPercentageResult] = await prisma.$transaction([
                prisma.fatPercentage.delete({ where: { id: input.fatPercentageId } }),
            ])
            return {
                fatPercentageResult
            }
        } catch(error) {
            console.log(error)
        }
        return {
            input
        }
    })
})