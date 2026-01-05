import { stub } from "../../symbols";
import type { FunctionStub, FunctionStubMetadata } from "../stub";

/**
 * Creates a function stub that throws an error when invoked.
 * It also records each invocation's arguments, exceptions, and timestamps.
 * @typeParam TObject - The type of the object containing the function.
 * @typeParam TKey - The key of the function within the object.
 * @typeParam TArgs - The types of the arguments the function accepts.
 * @returns A function stub that throws an error on invocation and records invocations.
 * @example
 * ```ts
 * stub(myStubbedObject).someMethod = throwOnCall(() => new Error("method was called"));
 * ```
 * @param errorFactory
 */
export function throwOnCall<
    const TObject extends object,
    const TKey extends keyof TObject,
    const TArgs extends Array<unknown>
>(errorFactory: () => Error): FunctionStub<TObject, TKey, TArgs, never> {
    const metadata: FunctionStubMetadata<TArgs, never> = { calls: [] };
    return {
        [stub]: {
            invoke: function(_thisArg, _propertyName, ...args) {
                const error = errorFactory();
                metadata.calls.push({ args, exception: error, time: BigInt(Math.floor(performance.now() * 1000000)) });
                throw error;
            },
            type: "function",
            metadata
        }
    };
}
