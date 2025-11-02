import {FunctionStub, FunctionStubMetadata} from "../stub";
import {stub} from "../../symbols";
import {runCatching} from "../../run-catching";

export function answer<const TObject extends object, const TKey extends keyof TObject, const TArgs extends Array<unknown>, const TReturn>(
    answerFunction: (this: TObject, ...args: TArgs) => TReturn
): FunctionStub<TObject, TKey, TArgs, TReturn> {
    const metadata: FunctionStubMetadata<TArgs, TReturn> = {
        calls: []
    };
    return {
        [stub]: {
            invoke: function (thisArg, _propertyName, ...args) {
                const result = runCatching(answerFunction, thisArg, ...args);
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
