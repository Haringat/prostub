import type {AnyFunction} from "./any-function.js";
import type {UnionZip} from "./union-zip.js";
import type {ParametersOfTuple} from "./parameters-of-tuple.js";
import type {OverloadToTuple} from "./overload-to-tuple.js";

export type MethodArgs<TFunction extends AnyFunction> =
    UnionZip<ParametersOfTuple<OverloadToTuple<TFunction>>>;
