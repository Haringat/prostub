import { stub } from "../../symbols.js";
import type { FunctionStub, FunctionStubMetadata } from "../stub.js";

/**
 * Creates a function stub that always returns a fixed value when invoked.
 * It also records each invocation's arguments, return values, and timestamps.
 * @typeParam TObject - The type of the object containing the function.
 * @typeParam TKey - The key of the function within the object.
 * @typeParam TArgs - The types of the arguments the function accepts.
 * @typeParam TReturn - The return type of the function.
 * @returns A function stub that always returns the specified fixed value and records invocations.
 * @example
 * ```ts
 * stub(myStubbedObject).someMethod = returnFixed(42);
 * ```
 * @param returnValue
 */
export function returnFixed<
    const TObject extends object,
    const TKey extends keyof TObject,
    const TArgs extends Array<unknown>,
    const TReturn
>(returnValue: TReturn): FunctionStub<TObject, TKey, TArgs, TReturn> {
    const metadata: FunctionStubMetadata<TArgs, TReturn> = { calls: [] };
    return {
        [stub]: {
            invoke: function(_thisArg, _propertyName, ...args) {
                metadata.calls.push({ args, returnValue, time: BigInt(Math.floor(performance.now() * 1000000)) });
                return returnValue;
            },
            type: "function",
            metadata
        }
    };
}
