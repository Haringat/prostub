export type PredicateTuple<TArgs extends ReadonlyArray<unknown>> =
    TArgs extends readonly [] ?
        [] :
        TArgs extends readonly [infer TFirst, ...infer TRest] ?
            [(it: TFirst) => boolean, ...PredicateTuple<TRest>] :
            never;
