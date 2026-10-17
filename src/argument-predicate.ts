export type ArgumentPredicate<TArgs extends Array<unknown>> = TArgs extends [infer TFirst, ...infer TRest] ?
    [((arg: unknown) => arg is TFirst), ...ArgumentPredicate<TRest>] :
    TArgs extends [infer TSingle] ? [(arg: unknown) => arg is TSingle] :
    TArgs extends [] ? [] :
    never;
