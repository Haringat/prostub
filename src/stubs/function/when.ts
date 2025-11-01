import {FunctionStub, FunctionStubMetadata} from "../stub";
import {stub} from "../../symbols";
import {ArgumentPredicate} from "../../argument-predicate";

class OngoingFunctionStub<TThis extends object, TKey extends keyof TThis, TArgs extends Array<unknown>, TReturn> implements FunctionStub<TThis, TKey, TArgs, TReturn> {
    get [stub]() {
        const _this = this;
        return {
            invoke: (thisArg: TThis, propertyName: TKey, ...args: TArgs) => this.#invoke(thisArg, propertyName, ...args),
            type: "function" as const,
            metadata: {
                get calls() {
                    return [
                        ...(_this.#parentStub ? _this.#parentStub[stub].metadata.calls : []),
                        ..._this.#stub[stub].metadata.calls
                    ]
                }
            } as FunctionStubMetadata<TArgs, TReturn>
        };
    }
    readonly #argumentPredicates: ArgumentPredicate<TArgs>;
    readonly #stub: FunctionStub<TThis, TKey, TArgs, TReturn>;
    readonly #parentStub?: OngoingFunctionStub<TThis, TKey, TArgs, TReturn>;

    constructor(argumentPredicates: ArgumentPredicate<TArgs>, stub: FunctionStub<TThis, TKey, TArgs, TReturn>, parentStub?: OngoingFunctionStub<TThis, TKey, TArgs, TReturn>) {
        this.#argumentPredicates = argumentPredicates;
        this.#stub = stub;
        this.#parentStub = parentStub;
    }

    when(...argumentPredicates: ArgumentPredicate<TArgs>): OngoingFunctionStubBuilder<TThis, TKey, TArgs, TReturn> {
        return new OngoingFunctionStubBuilder(argumentPredicates, this);
    }

    #invoke(thisArg: TThis, propertyName: TKey, ...args: TArgs): TReturn {
        if (this.#parentStub && this.#parentStub.#matchesArguments(args)) {
            return this.#parentStub.#invoke(thisArg, propertyName, ...args);
        } else if (this.#matchesArguments(args)) {
            return this.#stub[stub].invoke(thisArg, propertyName, ...args);
        } else {
            throw new Error("No matching stub found for the given arguments.");
        }
    }

    #matchesArguments(args: TArgs): boolean {
        return args.every((arg, index) => this.#argumentPredicates[index](arg));
    }
}

class OngoingFunctionStubBuilder<TThis extends object, TKey extends keyof TThis, TArgs extends Array<unknown>, TReturn> implements FunctionStub<TThis, TKey, TArgs, TReturn> {
    get [stub]() {
        return {
            invoke: (_thisArg: TThis, _propertyName: TKey, ..._args: TArgs) => {
                throw new Error("Cannot invoke a stub builder. Please complete the stub definition using 'then' before invoking.");
            },
            type: "function" as const,
            metadata: {
                calls: []
            }
        };
    }

    readonly #argumentPredicates: ArgumentPredicate<TArgs>;
    readonly #parentStub?: OngoingFunctionStub<TThis, TKey, TArgs, TReturn>;

    constructor(argumentPredicates: ArgumentPredicate<TArgs>, parentStub?: OngoingFunctionStub<TThis, TKey, TArgs, TReturn>) {
        this.#argumentPredicates = argumentPredicates;
        this.#parentStub = parentStub;
    }

    then(stub: FunctionStub<TThis, TKey, TArgs, TReturn>): OngoingFunctionStub<TThis, TKey, TArgs, TReturn> {
        return new OngoingFunctionStub(this.#argumentPredicates, stub, this.#parentStub);
    }
}

export function when<TObject extends object, TKey extends keyof TObject, TArgs extends Array<unknown>, TReturn>(...argumentPredicates: ArgumentPredicate<TArgs>): OngoingFunctionStubBuilder<TObject, TKey, TArgs, TReturn> {
    return new OngoingFunctionStubBuilder(argumentPredicates);
}
