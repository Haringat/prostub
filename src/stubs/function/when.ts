import type { ArgumentPredicate } from "../../argument-predicate.js";
import { stub } from "../../symbols.js";
import type { FunctionStub, FunctionStubMetadata } from "../stub.js";

/**
 * Ongoing function stub that matches specific argument predicates.
 * It allows chaining multiple stubs with different argument matching criteria.
 * @typeParam TThis - The type of the object containing the function.
 * @typeParam TKey - The key of the function within the object.
 * @typeParam TArgs - The types of the arguments the function accepts.
 * @typeParam TReturn - The return type of the function.
 */
class OngoingFunctionStub<
    const TThis extends object,
    const TKey extends keyof TThis,
    const TArgs extends Array<unknown>,
    const TReturn
> implements FunctionStub<TThis, TKey, TArgs, TReturn> {
    get [stub](): {
        invoke: (thisArg: TThis, propertyName: TKey, ...args: TArgs) => TReturn;
        type: "function";
        metadata: FunctionStubMetadata<TArgs, TReturn>;
    } {
        return {
            invoke: (thisArg: TThis, propertyName: TKey, ...args: TArgs) =>
                this.#invoke(thisArg, propertyName, ...args),
            type: "function" as const,
            metadata: {
                calls: [
                    ...(this.#parentStub ?
                        this.#parentStub[stub].metadata.calls :
                        []),
                    ...this
                        .#stub[stub]
                        .metadata
                        .calls
                ]
            }
        };
    }

    readonly #argumentPredicates: ArgumentPredicate<TArgs>;
    readonly #stub: FunctionStub<TThis, TKey, TArgs, TReturn>;

    readonly #parentStub?: OngoingFunctionStub<TThis, TKey, TArgs, TReturn>;

    constructor(
        argumentPredicates: ArgumentPredicate<TArgs>,
        functionStub: FunctionStub<TThis, TKey, TArgs, TReturn>,
        parentStub?: OngoingFunctionStub<TThis, TKey, TArgs, TReturn>
    ) {
        this.#argumentPredicates = argumentPredicates;
        this.#stub = functionStub;
        this.#parentStub = parentStub;
    }

    /**
     * Begins the definition of an additional function stub that matches specific argument predicates.
     * Use the returned builder to complete the stub definition with the `then` method.
     * @returns An ongoing function stub builder for defining the stub behavior.
     * @typeParam TThis - The type of the object containing the function.
     * @typeParam TKey - The key of the function within the object.
     * @typeParam TArgs - The types of the arguments the function accepts.
     * @typeParam TReturn - The return type of the function.
     * @param argumentPredicates - The predicates to match the function arguments.
     */
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

/**
 * Builder for defining ongoing function stubs with argument matching.
 * Use the `then` method to complete the stub definition.
 * @typeParam TThis - The type of the object containing the function.
 * @typeParam TKey - The key of the function within the object.
 * @typeParam TArgs - The types of the arguments the function accepts.
 * @typeParam TReturn - The return type of the function.
 */
class OngoingFunctionStubBuilder<
    const TThis extends object,
    const TKey extends keyof TThis,
    const TArgs extends Array<unknown>,
    const TReturn
> implements FunctionStub<TThis, TKey, TArgs, TReturn> {
    get [stub]() {
        return {
            invoke: (_thisArg: TThis, _propertyName: TKey, ..._args: TArgs) => {
                throw new Error(
                    "Cannot invoke a stub builder. Please complete the stub definition using 'then' before invoking."
                );
            },
            type: "function" as const,
            metadata: { calls: [] }
        };
    }

    readonly #argumentPredicates: ArgumentPredicate<TArgs>;
    readonly #parentStub?: OngoingFunctionStub<TThis, TKey, TArgs, TReturn>;

    constructor(
        argumentPredicates: ArgumentPredicate<TArgs>,
        parentStub?: OngoingFunctionStub<TThis, TKey, TArgs, TReturn>
    ) {
        this.#argumentPredicates = argumentPredicates;
        this.#parentStub = parentStub;
    }

    /**
     * Completes the stub definition by specifying the function stub to use when the argument predicates match.
     * @returns An ongoing function stub that can be further extended with additional argument matching.
     * @typeParam TThis - The type of the object containing the function.
     * @typeParam TKey - The key of the function within the object.
     * @typeParam TArgs - The types of the arguments the function accepts.
     * @typeParam TReturn - The return type of the function.
     * @param nextStub - The function stub to use when the argument predicates match.
     */
    then(nextStub: FunctionStub<TThis, TKey, TArgs, TReturn>): OngoingFunctionStub<TThis, TKey, TArgs, TReturn> {
        return new OngoingFunctionStub(this.#argumentPredicates, nextStub, this.#parentStub);
    }
}

/**
 * Begins the definition of a function stub that matches specific argument predicates.
 * Use the returned builder to complete the stub definition with the `then` method.
 * @typeParam TObject - The type of the object containing the function.
 * @typeParam TKey - The key of the function within the object.
 * @typeParam TArgs - The types of the arguments the function accepts.
 * @typeParam TReturn - The return type of the function.
 * @returns An ongoing function stub builder for defining the stub behavior.
 * @example
 * ```ts
 * stub(myStubbedObject).someMethod = when(
 *     arg1 => arg1 > 0,
 *     arg2 => arg2 === "test"
 * )
 * .then(returnValue(42))
 * .when(
 *     arg1 => arg1 <= 0,
 *     arg2 => arg2 === "test"
 * )
 * .then(throwError(new Error("arg1 must be positive")));
 * ```
 * @param argumentPredicates - The predicates to match the function arguments.
 */
export function when<
    const TObject extends object,
    const TKey extends keyof TObject,
    const TArgs extends Array<unknown>,
    const TReturn
>(...argumentPredicates: ArgumentPredicate<TArgs>): OngoingFunctionStubBuilder<TObject, TKey, TArgs, TReturn> {
    return new OngoingFunctionStubBuilder(argumentPredicates);
}
