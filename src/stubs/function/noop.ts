import { stub } from "../../symbols.js";
import type { Stub } from "../stub.js";
import type { VoidFunction } from "../../util/void-function.js";

/**
 * Creates a no-operation function stub that records each invocation's arguments and timestamps.
 * @typeParam TObject - The type of the object containing the function.
 * @typeParam TKey - The key of the function within the object.
 * @typeParam TFunction - The type of the function.
 * @returns A no-operation function stub that records invocations.
 * @example
 * ```ts
 * stub(myStubbedObject).someMethod.override(noop());
 * ```
 */
export function noop<const TFunction extends VoidFunction>(): Stub<TFunction> {
    let wrappedFunction: TFunction;
    const metadata: Stub<TFunction>[typeof stub] = {
        interactions: {
            get: (_receiver) => {
                wrappedFunction = function(...args: Parameters<TFunction>): void {
                    metadata.interactionRecords.invocations.push({
                        time: BigInt(Math.floor(performance.now() * 1000000)),
                        args: args,
                        returnValue: undefined
                    });
                    return undefined;
                } as TFunction;
                metadata.interactionRecords.reads.push({
                    time: BigInt(Math.floor(performance.now() * 1000000)),
                    value: wrappedFunction as TFunction
                })
                return wrappedFunction as TFunction;
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
