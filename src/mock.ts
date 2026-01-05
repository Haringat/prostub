import { spy } from "./spy";
import type { Mock } from "./stubs/stub";
import type { Type } from "./type";
import type { stub } from "./stub";

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
 */
export function mock<const TObject extends object>(clazz: Type<TObject>): Mock<TObject> {
    const instance = Object.create(clazz.prototype) as Mock<TObject>;
    return spy(instance);
}
