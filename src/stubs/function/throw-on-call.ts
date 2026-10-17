import { stub } from "../../symbols.js";
import type { Stub } from "../stub.js";
import type { AnyFunction } from "../../util/any-function.js";

/**
 * Creates a function stub that throws an error when invoked.
 * It also records each invocation's arguments, exceptions, and timestamps.
 * @returns A function stub that throws an error on invocation and records invocations.
 * @example
 * ```ts
 * stub(myStubbedObject).someMethod.override(throwOnCall(() => new Error("method was called")));
 * ```
 * @param errorFactory
 */
export function throwOnCall(errorFactory: () => Error): Stub<AnyFunction> {
    let wrappedFunction: AnyFunction;
    const metadata: Stub<AnyFunction>[typeof stub] = {
        interactions: {
            get: (_receiver) => {
                wrappedFunction = function(...args: Parameters<AnyFunction>) {
                    const error = errorFactory();
                    metadata.interactionRecords.invocations.push({
                        time: BigInt(Math.floor(performance.now() * 1000000)),
                        args: args,
                        error
                    });
                    throw error;
                } as AnyFunction;
                metadata.interactionRecords.reads.push({
                    time: BigInt(Math.floor(performance.now() * 1000000)),
                    value: wrappedFunction
                })
                return wrappedFunction;
            },
            set: (_receiver, _value) => {
                throw new Error("Cannot set overridden noop function");
            }
        },
        interactionRecords: {
            reads: [],
            writes: [],
            invocations: []
        }
    };
    return {
        [stub]: metadata
    };
}
