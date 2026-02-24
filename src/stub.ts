import { mock } from "./mock.js";
import { spy } from "./spy.js";
import type { Mock, Stub, Stubbable } from "./stubs/stub.js";
import { mock as mockSymbol, stub as stubSymbol } from "./symbols.js";

/**
 * Creates a {@link Stubbable} for the given mock or spy. The returned object allows you to define stubs for methods and properties on the mock or spy.
 * @returns A stubbable object for defining stubs on the mock or spy.
 * @example
 * ```ts
 * const myMock = mock(MyClass);
 * const myStubs = stub(myMock);
 * myStubs.myMethod = returnFixed("stubbed value");
 * myStubs.myProperty = fixedValue(42);
 * ```
 *
 * @see {@link mock} for creating mock instances of classes.
 * @see {@link spy} for creating spies on real instances.
 * @param mockOrSpy The mock or spy to create stubs for. Must be created using the `mock` or `spy` functions.
 */
export function stub<const TObject extends object>(mockOrSpy: Mock<TObject>): Stubbable<TObject> {
    const stubs = mockOrSpy[mockSymbol].stubs;
    return new Proxy({} as Stubbable<TObject>, {
        set(
            _target: Stubbable<TObject>,
            propertyName: string | symbol,
            newValue: unknown,
            _receiver: unknown
        ): boolean {
            if (typeof newValue !== "object" || newValue === null || !Reflect.has(newValue, stubSymbol)) {
                throw new Error(
                    `Stub value for property "${
                        String(propertyName)
                    }" must be a stub created by a stub factory function.`
                );
            }
            if (stubs.hasOwnProperty(propertyName)) {
                throw new Error(`Stub for property "${String(propertyName)}" is already defined.`);
            }
            stubs[propertyName as keyof TObject] = newValue as typeof stubs[keyof TObject];
            return true;
        },
        get(
            _target: Stubbable<TObject>,
            propertyName: string | symbol,
            _receiver: unknown
        ): Stub<TObject, keyof TObject> | undefined {
            throw new Error(
                `Cannot get stub for property "${String(propertyName)}". Stubs can only be set, not retrieved.`
            );
        }
    });
}
