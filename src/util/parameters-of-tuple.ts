export type ParametersOfTuple<T extends Array<unknown>> =
    T extends [] ?
        [] :
        T extends [(...args: infer TOnlyArgs) => unknown] ?
            [TOnlyArgs] :
            T extends [(...args: infer TFirstArgs) => unknown, ...infer Rest] ?
                [...ParametersOfTuple<Rest>, TFirstArgs] :
                never;
