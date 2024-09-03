import { z } from 'zod'

export const createWeightSchema = z.object({
    weight: z.number().positive().min(1).max(1000)
})

export const createFatPercentageSchema = z.object({
    fatPercentage: z.number().positive().min(1).max(100)
})


