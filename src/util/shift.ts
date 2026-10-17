export type Shift<T extends ReadonlyArray<unknown>> =
    T extends readonly []
        ? []
        : ((...args: T) => void) extends (first: never, ...rest: infer Rest) => void
            ? Rest
            : [];