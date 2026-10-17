export type TupleToUnion<T extends ReadonlyArray<unknown>> =
    T extends [infer First, ...infer Rest] ?
        First | TupleToUnion<Rest> :
        never;
