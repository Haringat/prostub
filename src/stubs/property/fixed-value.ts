import {stub} from "../../symbols";
import {PropertyStub, PropertyStubMetadata} from "../stub";

export function fixedValue<const TThis extends object, const TKey extends keyof TThis>(value: TThis[TKey]): PropertyStub<TThis, TKey> {
    type TValue = TThis[TKey];
    const metadata: PropertyStubMetadata<TValue> = {
        reads: [],
        assignments: []
    };
    return {
        [stub]: {
            type: "property",
            get(_thisArg, _propertyName) {
                metadata.reads.push({
                    value,
                    readTime: new Date()
                });
                return value;
            },
            set(_thisArg, _propertyName, _newValue) {
                metadata.assignments.push({
                    newValue: _newValue,
                    assignmentTime: new Date()
                });
                throw new Error("Cannot set value of a fixedValue property stub.");
            },
            metadata
        }
    };
}
