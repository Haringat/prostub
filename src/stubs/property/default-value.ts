import { stub } from "../../symbols.js";
import type { Stub } from "../stub.js";

/**
 * Creates a property stub that returns a default value.
 *
 * The property stub will track reads and assignments to the property.
 * @typeParam TType - The type of the property.
 * @returns A property stub that returns the specified default value and tracks reads and assignments.
 * @example
 * ```ts
 * stub(myStubbedObject).someProperty.override(defaultValue(10));
 * ```
 * @param value - The default value to be returned by the property stub.
 */
export function defaultValue<const TType>(value: TType): Stub<TType> {
    let currentValue = value;
    const metadata = {
        interactions: {
            get: (_receiver: unknown) => {
                metadata.interactionRecords.reads.push({
                    value: currentValue,
                    time: BigInt(Math.floor(performance.now() * 1000000))
                });
                return currentValue;
            },
            set: (_receiver: unknown, newValue: TType) => {
                metadata.interactionRecords.writes.push({
                    newValue,
                    time: BigInt(Math.floor(performance.now() * 1000000))
                });
                currentValue = newValue;
                return true;
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
