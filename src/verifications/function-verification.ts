import type { FunctionStubMetadata, InvocationRecord } from "../stubs/stub.js";
import { _throw } from "../util/throw.js";
import { InvocationVerification } from "./invocation-verification.js";

/**
 * Provides verification methods for function invocations.
 * @typeParam TArgs - The types of the function arguments.
 * @typeParam TReturn - The return type of the function.
 */
export class FunctionVerification<const TArgs extends Array<unknown>, const TReturn> {
    readonly #functionStubMetadata: FunctionStubMetadata<TArgs, TReturn>;

    constructor(functionStubMetadata: FunctionStubMetadata<TArgs, TReturn>) {
        this.#functionStubMetadata = functionStubMetadata;
    }

    /**
     * Checks if the function was called and verifies the invocation count against a provided predicate.
     * @param invocationCountPredicate
     */
    wasCalled(invocationCountPredicate: (n: number) => boolean = it => it === 1): void {
        if (!invocationCountPredicate(this.#functionStubMetadata.calls.length)) {
            throw new Error(
                `Expected invocation count to pass predicate. (was called ${this.#functionStubMetadata.calls.length} times)`
            );
        }
    }

    /**
     * Checks if the function was never called.
     */
    wasNotCalled(): void {
        this.wasCalledTimes(0);
    }

    /**
     * Checks the number of times the function was called against an expected count.
     * @param expectedCallCount - The expected number of times the function should have been called.
     */
    wasCalledTimes(expectedCallCount: number): void {
        this.wasCalled(it => it === expectedCallCount);
    }

    /**
     * Retrieves the verification for the nth invocation of the function.
     * @param invocationIndex
     */
    nthInvocation(invocationIndex: number): InvocationVerification<TArgs, TReturn> {
        if (invocationIndex < 0 || invocationIndex >= this.#functionStubMetadata.calls.length) {
            throw new Error(
                `Invocation index ${invocationIndex} is out of bounds. There are only ${this.#functionStubMetadata.calls.length} invocations.`
            );
        }
        const call = this.#functionStubMetadata.calls[invocationIndex];
        return new InvocationVerification<TArgs, TReturn>(call);
    }

    /**
     * Retrieves the verification for the first invocation of the function.
     */
    firstInvocation(): InvocationVerification<TArgs, TReturn> {
        return this.nthInvocation(0);
    }

    /**
     * Retrieves the verification for the last invocation of the function.
     */
    lastInvocation(): InvocationVerification<TArgs, TReturn> {
        return this.nthInvocation(this.#functionStubMetadata.calls.length - 1);
    }

    /**
     * Finds the first invocation that matches the provided predicate.
     * @param predicate - A function that tests the arguments of each invocation.
     * @deprecated Use `firstInvocationMatching` instead. This is only kept for backward compatibility.
     */
    invocationMatching(predicate: (...args: TArgs) => boolean): InvocationVerification<TArgs, TReturn> {
        return this.firstInvocationMatching(invocationRecord => predicate(...invocationRecord.args));
    }

    /**
     * Finds the first invocation that matches the provided predicate.
     * @param predicate - A function that tests the recorded information of each invocation
     */
    firstInvocationMatching(
        predicate: (invocationRecord: InvocationRecord<TArgs, TReturn>) => boolean
    ): InvocationVerification<TArgs, TReturn> {
        const call = this.#functionStubMetadata.calls.find(recordedCall => predicate(recordedCall)) ??
            _throw(new Error(`No invocation found matching the provided predicate.`));
        return new InvocationVerification(call);
    }

    /**
     * Finds the last invocation that matches the provided predicate.
     * @param predicate - A function that tests the recorded information of each invocation
     */
    lastInvocationMatching(
        predicate: (invocationRecord: InvocationRecord<TArgs, TReturn>) => boolean
    ): InvocationVerification<TArgs, TReturn> {
        const reversedCalls = this.#functionStubMetadata.calls.toReversed();
        const call = reversedCalls.find(recordedCall => predicate(recordedCall));
        if (!call) {
            throw new Error(`No invocation found matching the provided predicate.`);
        }
        return new InvocationVerification(call);
    }

    /**
     * Finds all invocations that match the provided predicate.
     * @param predicate - A function that tests the recorded information of each invocation
     */
    allInvocationsMatching(
        predicate: (invocationRecord: InvocationRecord<TArgs, TReturn>) => boolean
    ): Array<InvocationVerification<TArgs, TReturn>> {
        return this.#functionStubMetadata.calls.filter(recordedCall => predicate(recordedCall)).map(call =>
            new InvocationVerification(call)
        );
    }

    /**
     * Creates a new FunctionVerification instance for the same function but with different type parameters. You need this if the method has overloads, since the arguments of overloads of different lengths evaluate to `never` by default.
     * The type parameters you pass must be compatible with at least one of the overloads of the function, otherwise it will result in a type error.
     * @typeParam TOtherArgs - The types of the function arguments for the overload you want to verify.
     * @typeParam TOtherReturn - The return type of the function for the overload you want to verify.
     * @example
     * ```ts
     * // Given a function with overloads:
     * class X {
     *     overloadedMethod(x: number): number;
     *     overloadedMethod(x: number, x2: number): string;
     *     overloadedMethod(x: number, x2?: number): number | string {
     *         return x + (x2 ?? 0);
     *     }
     * }
     * // And a stub for it:
     * const mockedX = mock(X);
     * stub(mockedX).overloadedMethod = returnFixed(42);
     * mockedX.overloadedMethod(1);
     * // When we want to verify the overload with two arguments, we can use `pickOverload`:
     * const verification = verify(mockedX).overloadedMethod.pickOverload<[number], string>().firstInvocation().hadArguments(x => x === 1);
     * ```
     */
    pickOverload<TOtherArgs extends TArgs, TOtherReturn extends TReturn = TReturn>(): FunctionVerification<TOtherArgs, TOtherReturn> {
        return new FunctionVerification(this.#functionStubMetadata as FunctionStubMetadata<TOtherArgs, TOtherReturn>);
    }
}
