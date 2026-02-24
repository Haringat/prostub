import { stub } from "../../symbols.js";
import type { FunctionStub, FunctionStubMetadata } from "../stub.js";

/**
 * Creates a no-operation function stub that records each invocation's arguments and timestamps.
 * @typeParam TObject - The type of the object containing the function.
 * @typeParam TKey - The key of the function within the object.
 * @typeParam TArgs - The types of the arguments the function accepts.
 * @returns A no-operation function stub that records invocations.
 * @example
 * ```ts
 * stub(myStubbedObject).someMethod = noop();
 * ```
 */
export function noop<
    const TObject extends object,
    const TKey extends keyof TObject,
    const TArgs extends Array<unknown>
>(): FunctionStub<TObject, TKey, TArgs, void> {
    const metadata: FunctionStubMetadata<TArgs, void> = { calls: [] };
    return {
        [stub]: {
            invoke: function(_thisArg, _propertyName, ...args) {
                metadata.calls.push({ args, time: BigInt(Math.floor(performance.now() * 1000000)) });
            },
            type: "function",
            metadata
        }
    };
}
