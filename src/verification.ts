import { FunctionVerification } from "./verifications/function-verification";
import { PropertyVerification } from "./verifications/property-verification";

export type Verification<T> = {
    readonly [TKey in keyof T]: T[TKey] extends (...args: infer TArgs) => infer TReturn ?
        FunctionVerification<TArgs, TReturn> :
        PropertyVerification<T[TKey]>;
};
