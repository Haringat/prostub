import {PropertyVerification} from "./property-verification";
import {FunctionVerification} from "./function-verification";

export type Verifiable<T> = {
    readonly [TKey in keyof T]: T[TKey] extends (...args: infer TArgs) => infer TReturn ?
        FunctionVerification<TArgs, TReturn> :
        PropertyVerification<T[TKey]>;
}
