import { mock, stub } from "../symbols";

export interface InteractionRecord {
    time: bigint;
}

export interface InvocationRecord<TArgs extends Array<unknown>, TReturn> extends InteractionRecord {
    args: TArgs;
    returnValue?: TReturn;
    exception?: unknown;
}

export interface AssignmentRecord<TValue> extends InteractionRecord {
    newValue: TValue;
}

export interface ReadRecord<TValue> extends InteractionRecord {
    value: TValue;
}

export interface FunctionStub<TThis extends object, TKey extends keyof TThis, TArgs extends Array<unknown>, TReturn> {
    [stub]: {
        invoke: (thisArg: TThis, propertyName: TKey, ...args: TArgs) => TReturn;
        type: "function";
        metadata: FunctionStubMetadata<TArgs, TReturn>;
    };
}

export interface PropertyStubMetadata<TValue> {
    reads: Array<ReadRecord<TValue>>;
    assignments: Array<AssignmentRecord<TValue>>;
}

export interface FunctionStubMetadata<TArgs extends Array<unknown>, TReturn> {
    calls: Array<InvocationRecord<TArgs, TReturn>>;
}

export interface PropertyStub<TThis extends object, TKey extends keyof TThis> {
    [stub]: {
        metadata: PropertyStubMetadata<TThis[TKey]>;
        type: "property";
        get(thisArg: TThis, propertyName: TKey): TThis[TKey];
        set(thisArg: TThis, propertyName: TKey, newValue: TThis[TKey]): void;
    };
}

export type Stubbable<T extends object> = { -readonly [K in keyof T]: Stub<T, K>; };

export type Stub<TThis extends object, TKey extends keyof TThis> = TThis[TKey] extends
    (...args: infer TArgs) => infer TReturn ? FunctionStub<TThis, TKey, TArgs, TReturn> : PropertyStub<TThis, TKey>;

export type Mock<T extends object> = T & { [mock]: { stubs: { -readonly [TKey in keyof T]: Stub<T, TKey>; }; }; };
