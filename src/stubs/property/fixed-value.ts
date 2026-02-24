import { stub } from "../../symbols.js";
import type { PropertyStub, PropertyStubMetadata } from "../stub.js";

/**
 * Creates a property stub that always returns a fixed value.
 *
 * The property stub will track reads and assignments to the property.
 * Attempts to set a new value will result in an error.
 * @typeParam TThis - The type of the object containing the property.
 * @typeParam TKey - The key of the property within the object.
 * @returns A property stub that always returns the specified fixed value and tracks reads and assignments.
 * @example
 * ```ts
 * stub(myStubbedObject).someProperty = fixedValue(10);
 * ```
 * @param value - The fixed value to be returned by the property stub.
 */
export function fixedValue<const TThis extends object, const TKey extends keyof TThis>(
    value: TThis[TKey]
): PropertyStub<TThis, TKey> {
    type TValue = TThis[TKey];
    const metadata: PropertyStubMetadata<TValue> = { reads: [], assignments: [] };
    return {
        [stub]: {
            type: "property",
            get(_thisArg, _propertyName) {
                metadata.reads.push({ value, time: BigInt(Math.floor(performance.now() * 1000000)) });
                return value;
            },
            set(_thisArg, _propertyName, _newValue) {
                metadata.assignments.push({
                    newValue: _newValue,
                    time: BigInt(Math.floor(performance.now() * 1000000))
                });
                throw new Error("Cannot set value of a fixedValue property stub.");
            },
            metadata
        }
    };
}
