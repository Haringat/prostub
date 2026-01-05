import { runCatching } from "../../run-catching";
import { stub } from "../../symbols";
import type { FunctionStub, FunctionStubMetadata } from "../stub";

/**
 * Creates a function stub that uses the provided function to generate return values or throw exceptions when invoked.
 * It also records each invocation's arguments, return values, exceptions, and timestamps.
 * @typeParam TObject - The type of the object containing the function.
 * @typeParam TKey - The key of the function within the object.
 * @typeParam TArgs - The types of the arguments the function accepts.
 * @typeParam TReturn - The return type of the function.
 * @param answerFunction - The function to be used as the stub implementation.
 * @returns A function stub that records invocations and uses the provided function for behavior.
 * @example
 * ```ts
 * stub(myStubbedObject).someMethod = answer(function(this: MyObject, arg1: number, arg2: string): boolean {
 *     if (arg1 > 0) {
 *         return true;
 *     } else {
 *         throw new Error("arg1 must be positive");
 *     }
 * });
 * ```
 */
export function answer<
    const TObject extends object,
    const TKey extends keyof TObject,
    const TArgs extends Array<unknown>,
    const TReturn
>(answerFunction: (this: TObject, ...args: TArgs) => TReturn): FunctionStub<TObject, TKey, TArgs, TReturn> {
    const metadata: FunctionStubMetadata<TArgs, TReturn> = { calls: [] };
    return {
        [stub]: {
            invoke: function(thisArg, _propertyName, ...args) {
                const result = runCatching(answerFunction, thisArg, ...args);
                metadata.calls.push({
                    args,
                    ...(result.result === "success" ?
                        { returnValue: result.returnValue } :
                        { exception: result.error }),
                    time: BigInt(Math.floor(performance.now() * 1000000))
                });
                if (result.result === "error") {
                    throw result.error;
                }
                return result.returnValue;
            },
            type: "function",
            metadata
        }
    };
}
