import {stub} from "../symbols";

export interface InvocationRecord<TArgs extends Array<unknown>, TReturn> {
    args: TArgs;
    returnValue?: TReturn;
    invocationTime: Date;
    exception?: unknown;
}

export interface AssignmentRecord<TValue> {
    newValue: TValue;
    assignmentTime: Date;
}

export interface ReadRecord<TValue> {
    value: TValue;
    readTime: Date;
}

export interface FunctionStub<TThis extends object, TKey extends keyof TThis, TArgs extends Array<unknown>, TReturn> {
    [stub]: {
        invoke: (thisArg: TThis, propertyName: TKey,  ...args: TArgs) => TReturn;
        type: "function",
        metadata: FunctionStubMetadata<TArgs, TReturn>;
    };
}

export interface PropertyStubMetadata<TValue> {
    reads: Array<ReadRecord<TValue>>;
    assignments: Array<AssignmentRecord<TValue>>;
}

export type FunctionStubMetadata<TArgs extends Array<unknown>, TReturn> = {
    calls: Array<InvocationRecord<TArgs, TReturn>>;
};

export interface PropertyStub<TThis extends object, TKey extends keyof TThis> {
    [stub]: {
        type: "property",
        get(thisArg: TThis, propertyName: TKey): TThis[TKey];
        set(thisArg: TThis, propertyName: TKey, newValue: TThis[TKey]): void;
        metadata: {
            reads: Array<ReadRecord<TThis[TKey]>>;
            assignments: Array<AssignmentRecord<TThis[TKey]>>;
        }
    };
}

export type Stubbable<T extends object> = {
    -readonly [K in keyof T]: Stub<T, K>;
};

export type Stub<TThis extends object, TKey extends keyof TThis> = TThis[TKey] extends (...args: infer TArgs) => infer TReturn
    ? FunctionStub<TThis, TKey, TArgs, TReturn>
    : PropertyStub<TThis, TKey>;
