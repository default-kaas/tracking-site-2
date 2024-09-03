type trpcError = {
    code: string,
    expected: string,
    message: string,
    path: string[]
}

type TRPCArray = trpcError[]

function isTRPCErrorArray(array: TRPCArray | []):  array is TRPCArray   {
    return array.length > 0 && (array[0] as trpcError).path !== undefined;
}

export function useGetError(name: string, errors?: string) {
    if(errors) {
        const errorsArray = JSON.parse(errors)
        if (Array.isArray(errorsArray) && isTRPCErrorArray(errorsArray) && errorsArray[0].path[0] === name){
            return errorsArray[0].message
        }
    }
    return undefined
}