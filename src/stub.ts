import {mock as mockSymbol, stub as stubSymbol} from "./symbols";
import {Stub, Stubbable} from "./stubs/stub";

export function stub<const TObject extends object>(mockOrSpy: TObject & {
    [mockSymbol]: { stubs: { -readonly [TKey in keyof TObject]?: Stub<TObject, TKey> } }
}): Stubbable<TObject> {
    const stubs = mockOrSpy[mockSymbol].stubs;
    return new Proxy({} as Stubbable<TObject>, {
        set(_target: Stubbable<TObject>, propertyName: string | symbol, newValue: any, _receiver: unknown): boolean {
            if (typeof newValue !== "object" || newValue === null || !Reflect.has(newValue, stubSymbol)) {
                throw new Error(`Stub value for property "${String(propertyName)}" must be a stub created by a stub factory function.`);
            }
            if (stubs.hasOwnProperty(propertyName)) {
                throw new Error(`Stub for property "${String(propertyName)}" is already defined.`);
            }
            stubs[propertyName as keyof TObject] = newValue;
            return true;
        },
        get(_target: Stubbable<TObject>, propertyName: string | symbol, _receiver: unknown): Stub<TObject, keyof TObject> | undefined {
            throw new Error(`Cannot get stub for property "${String(propertyName)}". Stubs can only be set, not retrieved.`);
        }
    });
}
