import {Type} from "./type";
import {Stub} from "./stubs/stub";
import {mock as mockSymbol} from "./symbols";
import {spy} from "./spy";

export function mock<const TObject extends object>(clazz: Type<TObject>) {
    const instance = Object.create(clazz.prototype) as TObject & {[mockSymbol]: {stubs: {-readonly [TKey in keyof TObject]?: Stub<TObject, TKey>}}};
    return spy(instance);
}

