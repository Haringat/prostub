import {FunctionStub, FunctionStubMetadata} from "../stub";
import {stub} from "../../symbols";

export function returnSerial<TObject extends object, TKey extends keyof TObject, TArgs extends Array<unknown>, TReturn>(...values: Array<TReturn>): FunctionStub<TObject, TKey, TArgs, TReturn> {
    const metadata: FunctionStubMetadata<TArgs, TReturn> = {
        calls: []
    };
    return {
        [stub]: {
            type: "function",
            metadata,
            invoke: function (_thisArg, _propertyName, ...args): TReturn {
                const index = metadata.calls.length;
                if (index === values.length) {
                    const error = new Error(`No more return values left in returnSerial stub (called ${index + 1} times, but only ${values.length} values were provided)`);
                    metadata.calls.push({
                        args,
                        invocationTime: new Date(),
                        exception: error,
                    });
                    throw error;
                }
                const returnValue = values[index] as TReturn;
                metadata.calls.push({
                    args,
                    returnValue,
                    invocationTime: new Date()
                });
                return returnValue;
            }
        }
    };
}
