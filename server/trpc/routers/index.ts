import { router } from '~/server/trpc/trpc'
import { weightRouter } from '~/server/trpc/routers/weightRouter';

export const appRouter = router({
    weight: weightRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter