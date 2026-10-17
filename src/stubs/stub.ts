import {mock, stub} from "../symbols.js";
import type {AnyFunction} from "../util/any-function.js";
import type {MethodArgs} from "../util/method-args.js";
import type {PredicateTuple} from "../util/predicate-tuple.js";

export interface InteractionRecord {
    time: bigint;
}

export interface InvocationRecord<TFunction extends AnyFunction> extends InteractionRecord {
    args: Parameters<TFunction>;
    returnValue?: ReturnType<TFunction>;
    error?: unknown;
}

export interface AssignmentRecord<TValue> extends InteractionRecord {
    newValue: TValue;
}

export interface ReadRecord<TValue> extends InteractionRecord {
    value: TValue;
}

export interface Stub<TValueType> {
    [stub]: {
        interactions: {
            get(receiver: unknown): TValueType;
            set(receiver: unknown, newValue: TValueType): boolean;
        };
        interactionRecords: {
            reads: Array<ReadRecord<TValueType>>;
            writes: Array<AssignmentRecord<TValueType>>;
        } & (TValueType extends AnyFunction ? {
            invocations: Array<InvocationRecord<TValueType>>;
        } : object);
    };
}

export type ConditionalStubber<TFunction extends AnyFunction, IsSpy extends boolean> = {
    override(stub: Stub<TFunction>): OngoingStubChain<TFunction, IsSpy>;
} & (IsSpy extends true ? {
    passThrough(): OngoingStubChain<TFunction, IsSpy>;
} : object);

export type OngoingStubChain<TFunction extends AnyFunction, IsSpy extends boolean> = {
    on(...predicates: PredicateTuple<MethodArgs<TFunction>>): ConditionalStubber<TFunction, IsSpy>;
    override(stub: Stub<TFunction>): OngoingStubChain<TFunction, IsSpy>;
} & (IsSpy extends true ? {
    passThrough(): OngoingStubChain<TFunction, IsSpy>;
} : object);

export type MemberStubber<TValue, IsSpy extends boolean> = {
    override(stub: Stub<TValue>): void;
} & (IsSpy extends true ? {
    passThrough(): void;
} : object) & (TValue extends AnyFunction ? {
    on(...predicates: PredicateTuple<MethodArgs<TValue>>): ConditionalStubber<TValue, IsSpy>;
} : object);

export type StubbingMock<T extends object> = {
    readonly [K in keyof T]: MemberStubber<T[K], false>;
};

export type StubbingSpy<T extends object> = {
    readonly [K in keyof T]: MemberStubber<T[K], true>;
};

export type Stubbing<T extends object> = StubbingSpy<T> | StubbingMock<T>;

export type StubData<TObject extends object> = {
    readonly [TKey in keyof TObject]?: Stub<TObject[TKey]>;
}

export type Spy<T extends object> = T & {
    [mock]: {
        stubs: StubData<T>;
        type: "spy";
        target: T;
    };
};

export type Mock<T extends object> = T & {
    [mock]: {
        stubs: StubData<T>;
        type: "mock";
    };
};
