import "./global";
import {mock as mockSymbol, stub as stubSymbol} from "./symbols";
import {Stub} from "./stubs/stub";

export function spy<TObject extends object>(realObject: TObject): TObject & {
    [mockSymbol]: { stubs: { -readonly [TKey in keyof TObject]?: Stub<TObject, TKey> } }
} {
    const stubs = {} as { -readonly [TKey in keyof TObject]?: Stub<TObject, TKey> };
    return new Proxy(realObject as TObject & {
        [mockSymbol]: { stubs: { -readonly [TKey in keyof TObject]?: Stub<TObject, TKey> } }
    }, {
        set<TKey extends PropertyKey>(target: TObject, propertyName: TKey, newValue: unknown, _receiver: unknown): boolean {
            if (!stubs.hasOwnProperty(propertyName)) {
                throw new Error(`No stub defined for property "${String(propertyName)}".`);
            }
            const stubMetadata = stubs[propertyName]![stubSymbol];
            if (stubMetadata.type !== "property") {
                throw new Error(`Cannot set value of non-property stub "${String(propertyName)}".`);
            }
            stubMetadata.set(target, propertyName as never, newValue as any); // Cast to any is needed as TObject[TKey] does not work due to TS limitations
            return true;
        },
        get<TKey extends keyof TObject>(target: TObject, propertyName: string | number | symbol, _receiver: unknown): TObject[TKey] | {
            stubs: typeof stubs
        } {
            if (propertyName === mockSymbol) {
                return {stubs};
            }
            if (!stubs.hasOwnProperty(propertyName)) {
                throw new Error(`No stub defined for property "${String(propertyName)}".`);
            }
            const stubMetadata = stubs[propertyName as TKey & keyof TObject]![stubSymbol];
            if (stubMetadata.type === "function") {
                const returnValue = function (this: TObject, ...args: Parameters<TObject[TKey & keyof TObject] & ((...args: Array<unknown>) => unknown)>) {
                    return stubMetadata.invoke(
                        realObject,
                        propertyName as TKey & keyof TObject,
                        ...args
                    );
                }
                return returnValue as TObject[TKey & keyof TObject];
            } else {
                return stubMetadata.get(target, propertyName as TKey & keyof TObject);
            }
        },
        has(target: TObject, propertyName: string | number | symbol): boolean {
            return propertyName === mockSymbol || Reflect.has(target, propertyName);
        }
    });
}
