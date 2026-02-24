import { stub } from "../../symbols.js";
import type { PropertyStub, PropertyStubMetadata } from "../stub.js";

/**
 * Creates a property stub that tracks reads and assignments to the property.
 * The property stub will return the current value of the property.
 * @typeParam TObject - The type of the object containing the property.
 * @typeParam TKey - The key of the property within the object.
 * @returns A property stub that tracks reads and assignments to the property.
 * @example
 * ```ts
 * stub(myStubbedObject).someProperty = trackValue();
 * ```
 */
export function trackValue<const TObject extends object, const TKey extends keyof TObject>(): PropertyStub<
    TObject,
    TKey
> {
    type TValue = TObject[TKey];
    const metadata: PropertyStubMetadata<TValue> = { reads: [], assignments: [] };
    return {
        [stub]: {
            type: "property",
            get(thisArg, propertyName): TValue {
                const currentValue = thisArg[propertyName];
                metadata.reads.push({ value: currentValue, time: BigInt(Math.floor(performance.now() * 1000000)) });
                return currentValue;
            },
            set(thisArg, propertyName, newValue: TValue): void {
                thisArg[propertyName] = newValue;
                metadata.assignments.push({ newValue, time: BigInt(Math.floor(performance.now() * 1000000)) });
            },
            metadata
        }
    };
}
