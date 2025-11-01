import {stub} from "../../symbols";
import {FunctionStub, FunctionStubMetadata} from "../stub";

export function returnFixed<TObject extends object, TKey extends keyof TObject, TArgs extends Array<unknown>, TReturn>(
    returnValue: TReturn
): FunctionStub<TObject, TKey, TArgs, TReturn> {
    const metadata: FunctionStubMetadata<TArgs, TReturn> = {
        calls: []
    };
    return {
        [stub]: {
            invoke: function (_thisArg, _propertyName, ...args) {
                metadata.calls.push({
                    args,
                    returnValue,
                    invocationTime: new Date()
                });
                return returnValue;
            },
            type: "function",
            metadata,
        }
    };
}
