import { stub } from "../../symbols.js";
import type { Stub } from "../stub.js";
import type { OverloadToUnion } from "../../util/overload-to-union.js";
import type { AnyFunction } from "../../util/any-function.js";

/**
 * Creates a function stub that always returns a fixed value when invoked.
 * It also records each invocation's arguments, return values, and timestamps.
 * @typeParam TType - The type of the function.
 * @returns A function stub that always returns the specified fixed value and records invocations.
 * @example
 * ```ts
 * stub(myStubbedObject).someMethod.override(returnFixed(42));
 * ```
 * @param returnValue
 */
export function returnFixed<const TType extends AnyFunction>(returnValue: ReturnType<OverloadToUnion<TType>>): Stub<TType> {
    let wrappedFunction: TType;
    const metadata: Stub<TType>[typeof stub] = {
        interactions: {
            get: (_receiver) => {
                wrappedFunction = function(...args: Parameters<TType>) {
                    metadata.interactionRecords.invocations.push({
                        time: BigInt(Math.floor(performance.now() * 1000000)),
                        args: args,
                        returnValue: returnValue
                    });
                    return returnValue;
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
