import type {
    ConditionalStubber,
    Mock,
    OngoingStubChain,
    Spy,
    Stub,
    StubbingMock,
    StubbingSpy,
    StubData
} from "./stubs/stub.js";
import { mock as mockSymbol, stub as stubSymbol } from "./symbols.js";
import type { AnyFunction } from "./util/any-function.js";

function assertIsStub(propertyName: PropertyKey, behavior: unknown): asserts behavior is Stub<unknown> {
    if (typeof behavior !== "object" || behavior === null || !Reflect.has(behavior, stubSymbol)) {
        throw new Error(`Behavior for property "${String(propertyName)}" is not a stub.`);
    }
}

function assertNotStubbed<T extends object>(stubs: StubData<T>, propertyName: PropertyKey): void {
    if (stubs.hasOwnProperty(propertyName)) {
        throw new Error(`Stub for property "${String(propertyName)}" is already defined.`);
    }
}

// --- MOCK CONDITIONAL STUBBER (reines override, kein passThrough, kein realObject) ---

interface MockStubCase {
    predicates: Array<(it: unknown) => boolean>;
    stub: Stub<AnyFunction>;
}

function createMockConditionalStubber<TObject extends object>(
    propertyName: PropertyKey,
    stubs: StubData<TObject>
) {
    const cases: Array<MockStubCase> = [];
    let defaultStub: Stub<AnyFunction> | undefined;

    const compositeStub: Stub<AnyFunction> = {
        [stubSymbol]: {
            interactions: {
                get(receiver: unknown) {
                    const callable = function (this: unknown, ...args: Array<unknown>) {
                        const time = BigInt(Math.floor(performance.now() * 1000000));

                        const matchingCase = cases.find(c =>
                            c.predicates.every((predicate, index) => {
                                return typeof predicate !== "function" || Boolean(predicate(args[index]));
                            })
                        );

                        const targetStub = matchingCase ? matchingCase.stub : defaultStub;

                        if (!targetStub) {
                            const error = new Error(
                                `No matching stub case found for method "${String(propertyName)}" with arguments ${JSON.stringify(args)}.`
                            );
                            compositeStub[stubSymbol].interactionRecords.invocations.push({
                                time,
                                args: args as never,
                                error
                            });
                            throw error;
                        }

                        try {
                            const fn = targetStub[stubSymbol].interactions.get(receiver);
                            const returnValue = Reflect.apply(fn as AnyFunction, this, args);
                            compositeStub[stubSymbol].interactionRecords.invocations.push({
                                time,
                                args: args as never,
                                returnValue
                            });
                            return returnValue;
                        } catch (error) {
                            compositeStub[stubSymbol].interactionRecords.invocations.push({
                                time,
                                args: args as never,
                                error
                            });
                            throw error;
                        }
                    };

                    compositeStub[stubSymbol].interactionRecords.reads.push({
                        time: BigInt(Math.floor(performance.now() * 1000000)),
                        value: callable as never
                    });

                    return callable as never;
                },
                set(_receiver: unknown, newValue: unknown): boolean {
                    compositeStub[stubSymbol].interactionRecords.writes.push({
                        time: BigInt(Math.floor(performance.now() * 1000000)),
                        newValue: newValue as never
                    });
                    throw new Error(`Cannot set overridden method "${String(propertyName)}".`);
                }
            },
            interactionRecords: {
                reads: [],
                writes: [],
                invocations: []
            }
        }
    };

    const ensureRegistered = () => {
        if (!stubs.hasOwnProperty(propertyName)) {
            Reflect.set(stubs, propertyName, compositeStub);
        }
    };

    const chain: OngoingStubChain<AnyFunction, false> = {
        on(...predicates: Array<(it: unknown) => boolean>) {
            return {
                override(stub2: Stub<AnyFunction>) {
                    assertIsStub(propertyName, stub2);
                    cases.push({ predicates, stub: stub2 });
                    ensureRegistered();
                    return chain;
                }
            } as ConditionalStubber<AnyFunction, false>;
        },
        override(stub2: Stub<AnyFunction>) {
            assertIsStub(propertyName, stub2);
            defaultStub = stub2;
            ensureRegistered();
            return chain;
        }
    } as never;

    return chain;
}

// --- SPY CONDITIONAL STUBBER (override + passThrough mit echtem Target) ---

interface SpyStubCase {
    predicates: Array<(it: unknown) => boolean>;
    behavior: { type: "override"; stub: Stub<AnyFunction> } | { type: "passThrough" };
}

function createSpyConditionalStubber<TObject extends object>(
    propertyName: PropertyKey,
    stubs: StubData<TObject>,
    realObject: TObject
) {
    const cases: Array<SpyStubCase> = [];
    let defaultBehavior: { type: "override"; stub: Stub<AnyFunction> } | { type: "passThrough" } | undefined;

    const compositeStub: Stub<AnyFunction> = {
        [stubSymbol]: {
            interactions: {
                get(receiver: unknown) {
                    const callable = function (this: unknown, ...args: Array<unknown>) {
                        const time = BigInt(Math.floor(performance.now() * 1000000));

                        const matchingCase = cases.find(c =>
                            c.predicates.every((predicate, index) => {
                                return typeof predicate !== "function" || Boolean(predicate(args[index]));
                            })
                        );

                        const activeBehavior = matchingCase ? matchingCase.behavior : defaultBehavior;

                        if (!activeBehavior) {
                            const error = new Error(
                                `No matching stub case found for method "${String(propertyName)}" with arguments ${JSON.stringify(args)}.`
                            );
                            compositeStub[stubSymbol].interactionRecords.invocations.push({
                                time,
                                args: args as never,
                                error
                            });
                            throw error;
                        }

                        try {
                            let returnValue: unknown;
                            if (activeBehavior.type === "override") {
                                const fn = activeBehavior.stub[stubSymbol].interactions.get(receiver);
                                returnValue = Reflect.apply(fn as AnyFunction, this, args);
                            } else {
                                const realFn = Reflect.get(realObject, propertyName, receiver);
                                returnValue = Reflect.apply(realFn as AnyFunction, this === receiver ? realObject : this, args);
                            }

                            compositeStub[stubSymbol].interactionRecords.invocations.push({
                                time,
                                args: args as never,
                                returnValue
                            });
                            return returnValue;
                        } catch (error) {
                            compositeStub[stubSymbol].interactionRecords.invocations.push({
                                time,
                                args: args as never,
                                error
                            });
                            throw error;
                        }
                    };

                    compositeStub[stubSymbol].interactionRecords.reads.push({
                        time: BigInt(Math.floor(performance.now() * 1000000)),
                        value: callable as never
                    });

                    return callable as never;
                },
                set(_receiver: unknown, newValue: unknown): boolean {
                    compositeStub[stubSymbol].interactionRecords.writes.push({
                        time: BigInt(Math.floor(performance.now() * 1000000)),
                        newValue: newValue as never
                    });
                    throw new Error(`Cannot set overridden method "${String(propertyName)}".`);
                }
            },
            interactionRecords: {
                reads: [],
                writes: [],
                invocations: []
            }
        }
    };

    const ensureRegistered = () => {
        if (!stubs.hasOwnProperty(propertyName)) {
            Reflect.set(stubs, propertyName, compositeStub);
        }
    };

    const chain: OngoingStubChain<AnyFunction, true> = {
        on(...predicates: Array<(it: unknown) => boolean>) {
            return {
                override(stub2: Stub<AnyFunction>) {
                    assertIsStub(propertyName, stub2);
                    cases.push({ predicates, behavior: { type: "override", stub: stub2 } });
                    ensureRegistered();
                    return chain;
                },
                passThrough() {
                    cases.push({ predicates, behavior: { type: "passThrough" } });
                    ensureRegistered();
                    return chain;
                }
            } as ConditionalStubber<AnyFunction, true>;
        },
        override(stub2: Stub<AnyFunction>) {
            assertIsStub(propertyName, stub2);
            defaultBehavior = { type: "override", stub: stub2 };
            ensureRegistered();
            return chain;
        },
        passThrough() {
            defaultBehavior = { type: "passThrough" };
            ensureRegistered();
            return chain;
        }
    } as never;

    return chain;
}

// --- HAUPTFUNKTION ---

export function stub<const TObject extends object>(mockOrSpy: Mock<TObject>): StubbingMock<TObject>;
export function stub<const TObject extends object>(mockOrSpy: Spy<TObject>): StubbingSpy<TObject>;
export function stub<const TObject extends object>(mockOrSpy: Mock<TObject> | Spy<TObject>): StubbingMock<TObject> | StubbingSpy<TObject> {
    if (!mockOrSpy[mockSymbol]) {
        throw new Error("The provided object is neither a mock nor a spy.");
    }

    if (mockOrSpy[mockSymbol].type === "spy") {
        const spiedObject = mockOrSpy as Spy<TObject>;
        const realObject = spiedObject[mockSymbol].target;
        const stubs: StubData<TObject> = spiedObject[mockSymbol].stubs;

        return new Proxy({} as StubbingSpy<TObject>, {
            set(): boolean {
                throw new Error("Stubbing via property access (v1 semantics) is not supported anymore. Use the override() or passThrough() methods instead.");
            },
            get(_target: StubbingSpy<TObject>, propertyName: string | symbol) {
                const isMethod = typeof Reflect.get(realObject, propertyName) === "function";

                return {
                    override: (newBehavior: Stub<TObject[keyof TObject]>) => {
                        assertNotStubbed(stubs, propertyName);
                        assertIsStub(propertyName, newBehavior);
                        Reflect.set(stubs, propertyName, newBehavior);
                    },
                    passThrough: () => {
                        assertNotStubbed(stubs, propertyName);
                        const passThroughBehavior: Stub<TObject[keyof TObject]> = {
                            [stubSymbol]: {
                                interactions: {
                                    get(receiver: unknown) {
                                        const value = Reflect.get(realObject, propertyName, receiver);
                                        passThroughBehavior[stubSymbol].interactionRecords.reads.push({
                                            time: BigInt(Math.floor(performance.now() * 1000000)),
                                            value
                                        });

                                        if (typeof value === "function") {
                                            return new Proxy(value, {
                                                apply: (target, thisArg, args) => {
                                                    try {
                                                        const returnValue = Reflect.apply(target, thisArg === receiver ? realObject : thisArg, args);
                                                        (passThroughBehavior as Stub<TObject[keyof TObject] & AnyFunction>)[stubSymbol].interactionRecords.invocations.push({
                                                            time: BigInt(Math.floor(performance.now() * 1000000)),
                                                            args: args as never,
                                                            returnValue
                                                        });
                                                        return returnValue;
                                                    } catch (error) {
                                                        (passThroughBehavior as Stub<TObject[keyof TObject] & AnyFunction>)[stubSymbol].interactionRecords.invocations.push({
                                                            time: BigInt(Math.floor(performance.now() * 1000000)),
                                                            args: args as never,
                                                            error
                                                        });
                                                        throw error;
                                                    }
                                                }
                                            });
                                        }

                                        return value;
                                    },
                                    set(receiver: unknown, newValue: unknown): boolean {
                                        passThroughBehavior[stubSymbol].interactionRecords.writes.push({
                                            time: BigInt(Math.floor(performance.now() * 1000000)),
                                            newValue: newValue as never
                                        });
                                        Reflect.set(realObject, propertyName, newValue, receiver);
                                        return true;
                                    }
                                },
                                interactionRecords: {
                                    reads: [],
                                    writes: [],
                                    invocations: []
                                } as never
                            }
                        };
                        Reflect.set(stubs, propertyName, passThroughBehavior);
                    },
                    ...(isMethod ? {
                        on: (...predicates: Array<(it: unknown) => boolean>) => {
                            assertNotStubbed(stubs, propertyName);
                            // @ts-ignore - this is just too much for tsc to handle
                            return createSpyConditionalStubber(propertyName, stubs, realObject).on(...predicates);
                        }
                    } : {})
                };
            }
        }) as never;
    } else {
        const mockedObject = mockOrSpy as Mock<TObject>;
        const stubs: StubData<TObject> = mockedObject[mockSymbol].stubs;
        const prototype = Object.getPrototypeOf(mockedObject);

        return new Proxy({} as StubbingMock<TObject>, {
            set(): boolean {
                throw new Error("Stubbing via property access (v1 semantics) is not supported anymore. Use the override() or passThrough() methods instead.");
            },
            get(_target: StubbingMock<TObject>, propertyName: string | symbol) {
                // Bei Mocks sicher über den Prototypen prüfen, ohne den Proxy-Trap der Mock-Instanz auszulösen
                const isMethod = prototype != null && typeof Reflect.get(prototype, propertyName) === "function";

                return {
                    override: (newBehavior: Stub<TObject[keyof TObject]>) => {
                        assertNotStubbed(stubs, propertyName);
                        assertIsStub(propertyName, newBehavior);
                        Reflect.set(stubs, propertyName, newBehavior);
                    },
                    ...(isMethod ? {
                        on: (...predicates: Array<(it: unknown) => boolean>) => {
                            assertNotStubbed(stubs, propertyName);
                            return createMockConditionalStubber(propertyName, stubs).on(...predicates);
                        }
                    } : {})
                };
            }
        }) as never;
    }
}