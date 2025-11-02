import {FunctionStub, FunctionStubMetadata} from "../stub";
import {stub} from "../../symbols";

export function noop<const TObject extends object, const TKey extends keyof TObject, const TArgs extends Array<unknown>>(): FunctionStub<TObject, TKey, TArgs, void> {
    const metadata: FunctionStubMetadata<TArgs, void> = {
        calls: []
    };
    return {
        [stub]: {
            invoke: function (_thisArg, _propertyName, ...args) {
                metadata.calls.push({
                    args,
                    invocationTime: new Date()
                });
            },
            type: "function",
            metadata,
        }
    };
}
