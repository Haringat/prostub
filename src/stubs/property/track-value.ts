import {PropertyStub, PropertyStubMetadata} from "../stub";
import {stub} from "../../symbols";

export function trackValue<const TObject extends object, const TKey extends keyof TObject>(): PropertyStub<TObject, TKey> {
    type TValue = TObject[TKey];
    const metadata: PropertyStubMetadata<TValue> = {
        reads: [],
        assignments: [],
    };
    return {
        [stub]: {
            type: "property",
            get(thisArg, propertyName): TValue {
                const currentValue = thisArg[propertyName];
                metadata.reads.push({
                    value: currentValue,
                    readTime: new Date(),
                });
                return currentValue;
            },
            set(thisArg, propertyName, newValue: TValue): void {
                thisArg[propertyName] = newValue;
                metadata.assignments.push({
                    newValue,
                    assignmentTime: new Date(),
                });
            },
            metadata
        }
    };
}
