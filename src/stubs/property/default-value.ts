import { stub } from "../../symbols.js";
import type { PropertyStub, PropertyStubMetadata } from "../stub.js";

/**
 * Creates a property stub that returns a default value.
 *
 * The property stub will track reads and assignments to the property.
 * @typeParam TObject - The type of the object containing the property.
 * @typeParam TKey - The key of the property within the object.
 * @returns A property stub that returns the specified default value and tracks reads and assignments.
 * @example
 * ```ts
 * stub(myStubbedObject).someProperty = defaultValue(10);
 * ```
 * @param value - The default value to be returned by the property stub.
 */
export function defaultValue<const TObject extends object, const TKey extends keyof TObject>(
    value: TObject[TKey]
): PropertyStub<TObject, TKey> {
    type TValue = TObject[TKey];
    const metadata: PropertyStubMetadata<TValue> = { reads: [], assignments: [] };
    let currentValue = value;
    return {
        [stub]: {
            type: "property",
            get(_thisArg, _propertyName) {
                metadata.reads.push({ value: currentValue, time: BigInt(Math.floor(performance.now() * 1000000)) });
                return currentValue;
            },
            set(_thisArg, _propertyName, newValue) {
                metadata.assignments.push({ newValue, time: BigInt(Math.floor(performance.now() * 1000000)) });
                currentValue = newValue;
            },
            metadata
        }
    };
}
