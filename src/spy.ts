import "./global.js";
import type { mock } from "./mock.js";
import type { stub } from "./stub.js";
import { type Mock, type Stubbable } from "./stubs/stub.js";
import { mock as mockSymbol, stub as stubSymbol } from "./symbols.js";

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
 * @param realObject The real object to create a spy for.
 */
export function spy<const TObject extends object>(realObject: TObject): Mock<TObject> {
    const stubs = {} as Stubbable<TObject>;
    return new Proxy(realObject as Mock<TObject>, {
        set<TKey extends PropertyKey>(
            target: TObject,
            propertyName: TKey,
            newValue: unknown,
            _receiver: unknown
        ): boolean {
            if (!stubs.hasOwnProperty(propertyName)) {
                throw new Error(`No stub defined for property "${String(propertyName)}".`);
            }
            const stubMetadata = stubs[propertyName][stubSymbol];
            if (stubMetadata.type !== "property") {
                throw new Error(`Cannot set value of non-property stub "${String(propertyName)}".`);
            }
            stubMetadata.set(target, propertyName as never, newValue as never);
            return true;
        },
        get<TKey extends keyof TObject>(
            target: TObject,
            propertyName: PropertyKey,
            _receiver: unknown
        ): TObject[TKey] | { stubs: typeof stubs; } {
            if (propertyName === mockSymbol) {
                return { stubs };
            }
            if (!stubs.hasOwnProperty(propertyName)) {
                throw new Error(`No stub defined for property "${String(propertyName)}".`);
            }
            const stubMetadata = stubs[propertyName as TKey & keyof TObject][stubSymbol];
            if (stubMetadata.type === "function") {
                const returnValue = function(
                    this: TObject,
                    ...args: Parameters<TObject[TKey & keyof TObject] & ((...args: Array<unknown>) => unknown)>
                ) {
                    return stubMetadata.invoke(realObject, propertyName as TKey & keyof TObject, ...args);
                };
                return returnValue as TObject[TKey & keyof TObject];
            } else {
                return stubMetadata.get(target, propertyName as TKey & keyof TObject);
            }
        },
        has(target: TObject, propertyName: string | number | symbol): boolean {
            return propertyName === mockSymbol || Reflect.has(target, propertyName);
        }
    }) as Mock<TObject>;
}
