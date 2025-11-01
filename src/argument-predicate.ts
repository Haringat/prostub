export type ArgumentPredicate<TArgs extends Array<unknown>> = TArgs extends [infer TFirst, ...infer TRest] ?
    [((arg: TFirst) => boolean), ...ArgumentPredicate<TRest>] :
    TArgs extends [infer TSingle] ?
        [(arg: TSingle) => boolean] :
        TArgs extends [] ?
            [] :
            never;
