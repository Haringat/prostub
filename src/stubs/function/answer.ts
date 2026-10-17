import { stub } from "../../symbols.js";
import type { Stub } from "../stub.js";
import type { AnyFunction } from "../../util/any-function.js";
import type { UnionZip } from "../../util/union-zip.js";
import type { ParametersOfTuple } from "../../util/parameters-of-tuple.js";
import type { OverloadToTuple } from "../../util/overload-to-tuple.js";
import type { ReturnTypeOfTuple } from "../../util/return-type-of-tuple.js";
import type { TupleToUnion } from "../../util/tuple-to-union.js";

type AnswerFunction<TFunction extends AnyFunction> = (...args: UnionZip<ParametersOfTuple<OverloadToTuple<TFunction>>>) => TupleToUnion<ReturnTypeOfTuple<OverloadToTuple<TFunction>>>;

/**
 * Creates a function stub that uses the provided function to generate return values or throw exceptions when invoked.
 * It also records each invocation's arguments, return values, exceptions, and timestamps.
 * @typeParam TObject - The type of the object containing the function.
 * @typeParam TKey - The key of the function within the object.
 * @typeParam TFunction - The type of the function.
 * @param answerFunction - The function to be used as the stub implementation.
 * @returns A function stub that records invocations and uses the provided function for behavior.
 * @example
 * ```ts
 * stub(myStubbedObject).someMethod.override(answer((arg1: number, arg2: string): boolean => {
 *     if (arg1 > 0) {
 *         return true;
 *     } else {
 *         throw new Error("arg1 must be positive");
 *     }
 * }));
 * ```
 */
export function answer<const TType extends AnyFunction>(answerFunction: AnswerFunction<TType>): Stub<TType> {
    let wrappedFunction: typeof answerFunction;
    const metadata: Stub<TType>[typeof stub] = {
        interactions: {
            get: (receiver) => {
                wrappedFunction = function(...args: UnionZip<ParametersOfTuple<OverloadToTuple<TType>>>): TupleToUnion<ReturnTypeOfTuple<OverloadToTuple<TType>>> {
                    try {
                        const returnValue = answerFunction.apply(receiver, args);
                        metadata.interactionRecords.invocations.push({
                            time: BigInt(Math.floor(performance.now() * 1000000)),
                            args: args as Array<never>,
                            returnValue
                        });
                        return returnValue;
                    } catch (e) {
                        metadata.interactionRecords.invocations.push({
                            time: BigInt(Math.floor(performance.now() * 1000000)),
                            args: args as Array<never>,
                            error: e
                        });
                        throw e;
                    }
                };
                metadata.interactionRecords.reads.push({
                    time: BigInt(Math.floor(performance.now() * 1000000)),
                    value: wrappedFunction as TType
                })
                return wrappedFunction as TType;
            },
            set: (_receiver, _value) => {
                throw new Error("Cannot set overridden answer function");
            }
        },
        interactionRecords: {
            reads: [],
            writes: [],
            invocations: []
        } as never
    };
    return {
        [stub]: metadata
    };
}
