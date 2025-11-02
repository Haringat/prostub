import {stub} from "../../symbols";
import {FunctionStub, FunctionStubMetadata} from "../stub";
import {runCatching} from "../../run-catching";

export function callThrough<const TObject extends object, const TKey extends keyof TObject, const TArgs extends Array<unknown>, const TReturn>(): FunctionStub<TObject, TKey, TArgs, TReturn> {
    const metadata: FunctionStubMetadata<TArgs, TReturn> = {
        calls: []
    };
    return {
        [stub]: {
            invoke: function (thisArg, propertyName, ...args): TReturn {
                const result  = runCatching((...args: TArgs) => (thisArg[propertyName] as (this: TObject, ...args: TArgs) => TReturn)(...args), thisArg, ...args);
                metadata.calls.push({
                    args,
                    ...(result.result === "success" ? {returnValue: result.returnValue} : {exception: result.error}),
                    invocationTime: new Date()
                });
                if (result.result === "error") {
                    throw result.error;
                }
                return result.returnValue;
            },
            type: "function",
            metadata,
        }
    };
}
