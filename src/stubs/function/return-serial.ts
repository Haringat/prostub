import { stub } from "../../symbols.js";
import type { FunctionStub, FunctionStubMetadata } from "../stub.js";

/**
 * Creates a function stub that returns a series of specified values in order when invoked.
 * Once all values have been returned, further invocations will throw an error.
 * It also records each invocation's arguments, return values, exceptions, and timestamps.
 * @typeParam TObject - The type of the object containing the function.
 * @typeParam TKey - The key of the function within the object.
 * @typeParam TArgs - The types of the arguments the function accepts.
 * @typeParam TReturn - The return type of the function.
 * @returns A function stub that returns the specified values in order and records invocations.
 * @example
 * ```ts
 * stub(myStubbedObject).someMethod = returnSerial(1, 2, 3);
 * ```
 * @param values
 */
export function returnSerial<
    const TObject extends object,
    const TKey extends keyof TObject,
    const TArgs extends Array<unknown>,
    const TReturn
>(...values: Array<TReturn>): FunctionStub<TObject, TKey, TArgs, TReturn> {
    const metadata: FunctionStubMetadata<TArgs, TReturn> = { calls: [] };
    return {
        [stub]: {
            type: "function",
            metadata,
            invoke: function(_thisArg, _propertyName, ...args): TReturn {
                const index = metadata.calls.length;
                if (index === values.length) {
                    const error = new Error(
                        `No more return values left in returnSerial stub (called ${
                            index + 1
                        } times, but only ${values.length} values were provided)`
                    );
                    metadata.calls.push({
                        args,
                        time: BigInt(Math.floor(performance.now() * 1000000)),
                        exception: error
                    });
                    throw error;
                }
                const returnValue = values[index] as TReturn;
                metadata.calls.push({ args, returnValue, time: BigInt(Math.floor(performance.now() * 1000000)) });
                return returnValue;
            }
        }
    };
}
