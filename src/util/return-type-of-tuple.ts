export type ReturnTypeOfTuple<T extends Array<unknown>> =
    T extends [] ?
        [] :
        T extends [(...args: Array<never>) => infer TOnlyReturn] ?
            [TOnlyReturn] :
            T extends [(...args: Array<never>) => infer TFirstReturn, ...infer Rest] ?
                [...ReturnTypeOfTuple<Rest>, TFirstReturn] :
                never;
