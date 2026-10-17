import "./global.js";
import type { mock } from "./mock.js";
import type { stub } from "./stub.js";
import type { Spy, StubData } from "./stubs/stub.js";
import { mock as mockSymbol, stub as stubSymbol } from "./symbols.js";
import { _throw } from "./util/throw.js";

/**
 * Creates a spy for the given real object. A spy wraps the real object and allows you to stub methods and properties while still calling through to the real implementations by default.
 * @returns A mock object that wraps the real object and allows stubbing.
 * @example
 * ```ts
 * class MyClass {
 *     myMethod() {
 *         return "real value";
 *     }
 * }
 * const myRealInstance = new MyClass();
 * const mySpy = spy(myRealInstance);
 * // Now you can stub methods and properties on mySpy as needed.
 * ```
 *
 * @see {@link stub} for stubbing methods and properties on the spy.
 * @see {@link mock} for creating mock instances of classes.
 * @see {@link verify} for verifying interactions with the spy.
 * @param realObject The real object to create a spy for.
 */
export function spy<const TObject extends object>(realObject: TObject): Spy<TObject> {
    const stubs = {} as StubData<TObject>;
    return new Proxy(realObject as Spy<TObject>, {
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
                    type: "spy",
                    target: realObject
                };
            }
            const propertyData = stubs[propertyName as keyof typeof stubs] ?? _throw(new Error(`No stub defined for property "${String(propertyName)}".`));
            return propertyData[stubSymbol].interactions.get(target);
        },
        has(target: TObject, propertyName: string | number | symbol): boolean {
            return propertyName === mockSymbol || Reflect.has(target, propertyName) || Reflect.has(stubs, propertyName);
        }
    }) as Spy<TObject>;
}
