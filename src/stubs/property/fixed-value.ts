import { stub } from "../../symbols.js";
import type {Stub} from "../stub.js";

/**
 * Creates a property stub that always returns a fixed value.
 *
 * The property stub will track reads and assignments to the property.
 * Attempts to set a new value will result in an error.
 * @typeParam TType - The type of the property.
 * @returns A property stub that always returns the specified fixed value and tracks reads and assignments.
 * @example
 * ```ts
 * stub(myStubbedObject).someProperty.override(fixedValue(10));
 * ```
 * @param value - The fixed value to be returned by the property stub.
 */
export function fixedValue<const TType>(value: TType): Stub<TType> {
    const metadata = {
        interactions: {
            get: (_receiver: unknown) => {
                metadata.interactionRecords.reads.push({
                    value: value,
                    time: BigInt(Math.floor(performance.now() * 1000000))
                });
                return value;
            },
            set: (_receiver: unknown, newValue: TType) => {
                metadata.interactionRecords.writes.push({
                    newValue,
                    time: BigInt(Math.floor(performance.now() * 1000000))
                });
                throw new Error("Cannot set the value of a fixedValue property stub.");
            }
        },
        interactionRecords: {
            reads: [],
            writes: [],
            invocation: []
        }
    } as unknown as Stub<TType>[typeof stub];
    return {
        [stub]: metadata
    };
}
