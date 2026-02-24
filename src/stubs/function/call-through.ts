import { runCatching } from "../../run-catching.js";
import { stub } from "../../symbols.js";
import type { FunctionStub, FunctionStubMetadata } from "../stub.js";

/**
 * Creates a function stub that calls through to the original implementation of the function when invoked.
 * It also records each invocation's arguments, return values, exceptions, and timestamps.
 * @typeParam TObject - The type of the object containing the function.
 * @typeParam TKey - The key of the function within the object.
 * @typeParam TArgs - The types of the arguments the function accepts.
 * @typeParam TReturn - The return type of the function.
 * @returns A function stub that records invocations and calls through to the original implementation.
 * @example
 * ```ts
 * stub(mySpyObject).someMethod = callThrough();
 * ```
 */
export function callThrough<
    const TObject extends object,
    const TKey extends keyof TObject,
    const TArgs extends Array<unknown>,
    const TReturn
>(): FunctionStub<TObject, TKey, TArgs, TReturn> {
    const metadata: FunctionStubMetadata<TArgs, TReturn> = { calls: [] };
    return {
        [stub]: {
            invoke: function(thisArg, propertyName, ...args): TReturn {
                const result = runCatching(
                    (...args2: TArgs) =>
                        (thisArg[propertyName] as (this: TObject, ...args: TArgs) => TReturn)(...args2),
                    thisArg,
                    ...args
                );
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
