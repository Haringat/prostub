import { spy } from "./spy.js";
import type { stub } from "./stub.js";
import type { Mock, StubData } from "./stubs/stub.js";
import type { Type } from "./type.js";
import { _throw } from "./util/throw.js";
import { mock as mockSymbol, stub as stubSymbol } from "./symbols.js";

/**
 * Creates a mock instance of the given class.
 * @param clazz The class to mock.
 * @returns A mock instance of the class.
 * @example
 * ```ts
 * class MyClass {
 *     myMethod() {
 *         return "real value";
 *     }
 * }
 * const myClassMock = mock(MyClass);
 * // Now you can stub methods and properties on myClassMock as needed.
 * ```
 *
 * @see {@link stub} for stubbing methods and properties on the mock.
 * @see {@link spy} for creating spies on real instances.
 * @see {@link verify} for verifying interactions with the mock.
 */
export function mock<const TObject extends object>(clazz: Type<TObject>): Mock<TObject> {
    const instance = Object.create(clazz.prototype) as Mock<TObject>;
    const stubs = {} as StubData<TObject>;
    return new Proxy(instance as Mock<TObject>, {
        set(
            target: TObject,
            propertyName: string | symbol,
            newValue: unknown,
            _receiver: unknown
        ): boolean {
            const propertyData = stubs[propertyName as keyof typeof stubs] ?? _throw(new Error(`No stub defined for property "${String(propertyName)}".`));
            return propertyData[stubSymbol].interactions.set(target, newValue as never);
        },
        get(
            target: TObject,
            propertyName: string | symbol,
            _receiver: unknown
        ) {
            if (propertyName === mockSymbol) {
                return {
                    stubs,
                    type: "mock"
                };
            }
            const propertyData = stubs[propertyName as keyof typeof stubs] ?? _throw(new Error(`No stub defined for property "${String(propertyName)}".`));
            return propertyData[stubSymbol].interactions.get(target);
        },
        has(target: TObject, propertyName: string | number | symbol): boolean {
            return propertyName === mockSymbol || Reflect.has(target, propertyName) || Reflect.has(stubs, propertyName);
        }
    }) as Mock<TObject>;
}
