import {FunctionStub, FunctionStubMetadata} from "../stub";
import {stub} from "../../symbols";

export function throwOnCall<const TObject extends object, const TKey extends keyof TObject, const TArgs extends Array<unknown>>(
    errorFactory: () => Error
): FunctionStub<TObject, TKey, TArgs, never> {
    const metadata: FunctionStubMetadata<TArgs, never> = {
        calls: []
    };
    return {
        [stub]: {
            invoke: function (_thisArg, _propertyName, ...args) {
                const error = errorFactory();
                metadata.calls.push({
                    args,
                    exception: error,
                    invocationTime: new Date()
                });
                throw error;
            },
            type: "function",
            metadata,
        }
    };
}
