import {FunctionStub, FunctionStubMetadata} from "../stub";
import {stub} from "../../symbols";

export function noop<TObject extends object, TKey extends keyof TObject, TArgs extends Array<unknown>>(): FunctionStub<TObject, TKey, TArgs, void> {
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
