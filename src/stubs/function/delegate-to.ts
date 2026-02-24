import { stub } from "../../symbols.js";
import type { FunctionStub, FunctionStubMetadata } from "../stub.js";

/**
 * Creates a function stub that delegates its implementation to the provided delegate function.
 * It also records each invocation's arguments, return values, and timestamps.
 * @typeParam TObject - The type of the object containing the function.
 * @typeParam TKey - The key of the function within the object.
 * @typeParam TArgs - The types of the arguments the function accepts.
 * @typeParam TReturn - The return type of the function.
 * @returns A function stub that records invocations and delegates to the provided function.
 * @example
 * ```ts
 * stub(myStubbedObject).someMethod = delegateTo(function(this: MyObject, arg1: number, arg2: string): boolean {
 *     return arg1 > 0 && arg2.length > 0;
 * });
 * ```
 * @param delegateFunction - The function to which calls will be delegated.
 */
export function delegateTo<
    const TObject extends object,
    const TKey extends keyof TObject,
    const TArgs extends Array<unknown>,
    const TReturn
>(delegateFunction: (this: TObject, ...args: TArgs) => TReturn): FunctionStub<TObject, TKey, TArgs, TReturn> {
    const metadata: FunctionStubMetadata<TArgs, TReturn> = { calls: [] };
    return {
        [stub]: {
            invoke: function(thisArg, _propertyName, ...args) {
                metadata.calls.push({
                    args,
                    returnValue: delegateFunction.apply(thisArg, args),
                    time: BigInt(Math.floor(performance.now() * 1000000))
                });
                return delegateFunction.apply(thisArg, args);
            },
            type: "function",
            metadata
        }
    };
}
