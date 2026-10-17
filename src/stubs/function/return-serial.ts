import { stub } from "../../symbols.js";
import type { Stub } from "../stub.js";
import type { TupleToUnion } from "../../util/tuple-to-union.js";
import type { ReturnTypeOfTuple } from "../../util/return-type-of-tuple.js";
import type { OverloadToTuple } from "../../util/overload-to-tuple.js";
import type { AnyFunction } from "../../util/any-function.js";

/**
 * Creates a function stub that returns a series of specified values in order when invoked.
 * Once all values have been returned, further invocations will throw an error.
 * It also records each invocation's arguments, return values, exceptions, and timestamps.
 * @typeParam TType - The type of the function.
 * @returns A function stub that returns the specified values in order and records invocations.
 * @example
 * ```ts
 * stub(myStubbedObject).someMethod.override(returnSerial(1, 2, 3));
 * ```
 * @param values
 */
export function returnSerial<const TType extends AnyFunction>(...values: Array<TupleToUnion<ReturnTypeOfTuple<OverloadToTuple<TType>>>>): Stub<TType> {
    let wrappedFunction: TType;
    let index = 0;
    const metadata: Stub<TType>[typeof stub] = {
        interactions: {
            get: (_receiver) => {
                wrappedFunction = function(...args: Parameters<TType>) {
                    if (index >= values.length) {
                        const error = new Error(`No more values to return. Last value returned was ${values[values.length - 1]}.`);
                        metadata.interactionRecords.invocations.push({
                            time: BigInt(Math.floor(performance.now() * 1000000)),
                            args,
                            error
                        });
                        throw error;
                    } else {
                        const returnValue = values[index];
                        index++;
                        metadata.interactionRecords.invocations.push({
                            time: BigInt(Math.floor(performance.now() * 1000000)),
                            args: args,
                            returnValue
                        });
                        return returnValue;
                    }
                } as TType;
                metadata.interactionRecords.reads.push({
                    time: BigInt(Math.floor(performance.now() * 1000000)),
                    value: wrappedFunction as TType
                })
                return wrappedFunction as TType;
            },
            set: (_receiver, _value) => {
                throw new Error("Cannot set overridden noop function");
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
