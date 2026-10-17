import type {AnyFunction} from "./any-function.js";

export type ReturnTypeForArgs<
    F extends AnyFunction,
    Args extends Array<never>,
> = F extends (...args: infer AcceptedArgs) => infer Result
    ? [Args] extends [AcceptedArgs]
        ? Result
        : never
    : never;
