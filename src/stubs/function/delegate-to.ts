import {FunctionStub, FunctionStubMetadata} from "../stub";
import {stub} from "../../symbols";

export function delegateTo<TObject extends object, TKey extends keyof TObject, TArgs extends Array<unknown>, TReturn>(
    delegateFunction: (this: TObject, ...args: TArgs) => TReturn
): FunctionStub<TObject, TKey, TArgs, TReturn> {
    const metadata: FunctionStubMetadata<TArgs, TReturn> = {
        calls: []
    };
    return {
        [stub]: {
            invoke: function (thisArg, _propertyName, ...args) {
                metadata.calls.push({
                    args,
                    returnValue: delegateFunction.apply(thisArg, args),
                    invocationTime: new Date()
                });
                return delegateFunction.apply(thisArg, args);
            },
            type: "function",
            metadata,
        }
    };
}
