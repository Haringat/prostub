import {PropertyStub, PropertyStubMetadata} from "../stub";
import {stub} from "../../symbols";

export function defaultValue<TObject extends object, TKey extends keyof TObject>(value: TObject[TKey]): PropertyStub<TObject, TKey> {
    type TValue = TObject[TKey];
    const metadata: PropertyStubMetadata<TValue> = {
        reads: [],
        assignments: []
    };
    let currentValue = value;
    return {
        [stub]: {
            type: "property",
            get(_thisArg, _propertyName) {
                metadata.reads.push({
                    value: currentValue,
                    readTime: new Date()
                });
                return currentValue;
            },
            set(_thisArg, _propertyName, newValue) {
                metadata.assignments.push({
                    newValue,
                    assignmentTime: new Date()
                });
                currentValue = newValue;
            },
            metadata
        }
    };
}
