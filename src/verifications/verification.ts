import { AssignmentVerification } from "./assignment-verification.js";
import { ReadVerification } from "./read-verification.js";
import type { InvocationRecord, Stub } from "../stubs/stub.js";
import type { stub } from "../symbols.js";
import { InvocationVerification } from "./invocation-verification.js";
import { _throw } from "../util/throw.js";
import type {OverloadToUnion } from "../util/overload-to-union.js";
import type { ReturnTypeForArgs } from "../util/return-type-for-args.js";
import type { AnyFunction } from "../util/any-function.js";

/**
 * Provides verification methods for a spied or mocked property's interactions.
 */
export class Verification<const TValue> {
    readonly #propertyStubMetadata: Stub<TValue>[typeof stub]["interactionRecords"];

    constructor(propertyStubMetadata: Stub<TValue>[typeof stub]["interactionRecords"]) {
        this.#propertyStubMetadata = propertyStubMetadata;
    }

    /**
     * Checks the number of occurred reads against a fixed number.
     * @param expectedGetCallCount How many reads are expected to have occurred
     */
    wasReadNTimes(expectedGetCallCount = 1): void {
        this.wasRead(it => it === expectedGetCallCount);
    }

    /**
     * Checks the number of occurred reads against a predicate function.
     * @param readCountPredicate A predicate function that checks if the number of occurred reads matches the expectation
     */
    wasRead(readCountPredicate: (n: number) => boolean = it => it === 1): void {
        const actualGetCallCount = this.#propertyStubMetadata.reads.length;
        if (!readCountPredicate(actualGetCallCount)) {
            throw new Error(`Expected read count to pass predicate. (was read ${actualGetCallCount} times)`);
        }
    }

    /**
     * Checks the number of occurred assignments against a predicate function.
     * @param writeCountPredicate A predicate function that checks if the number of occurred assignments matches the expectation
     */
    wasAssigned(writeCountPredicate: (n: number) => boolean = it => it === 1): void {
        const actualSetCallCount = this.#propertyStubMetadata.writes.length;
        if (!writeCountPredicate(actualSetCallCount)) {
            throw new Error(`Expected read count to pass predicate. (was read ${actualSetCallCount} times)`);
        }
    }

    /**
     * Checks if the property has never been assigned.
     */
    wasNotAssigned(): void {
        this.wasAssigned(it => it === 0);
    }

    /**
     * Checks if the property has never been read.
     */
    wasNotRead(): void {
        this.wasReadNTimes(0);
    }

    /**
     * Checks the number of occurred assignments against a fixed number.
     * @param expectedSetCallCount How many assignments are expected to have occurred
     */
    wasAssignedNTimes(expectedSetCallCount = 1): void {
        this.wasAssigned(it => it === expectedSetCallCount);
    }

    /**
     * Gets the nth assignment verification.
     * @param index The zero-based index of the assignment to retrieve
     */
    nthAssignment(index: number): AssignmentVerification<TValue> {
        if (index < 0 || index >= this.#propertyStubMetadata.writes.length) {
            throw new Error(
                `Assignment index ${index} is out of bounds. There are only ${this.#propertyStubMetadata.writes.length} assignments.`
            );
        }
        return new AssignmentVerification(this.#propertyStubMetadata.writes[index]);
    }

    /**
     * Gets the first assignment verification.
     */
    firstAssignment(): AssignmentVerification<TValue> {
        return this.nthAssignment(0);
    }

    /**
     * Gets the last assignment verification.
     */
    lastAssignment(): AssignmentVerification<TValue> {
        return this.nthAssignment(this.#propertyStubMetadata.writes.length - 1);
    }

    /**
     * Gets the first read verification.
     */
    firstRead(): ReadVerification<TValue> {
        return this.nthRead(0);
    }

    /**
     * Gets the last read verification.
     */
    lastRead(): ReadVerification<TValue> {
        return this.nthRead(this.#propertyStubMetadata.reads.length - 1);
    }

    /**
     * Gets the nth read verification.
     * @param index The zero-based index of the read to retrieve
     */
    nthRead(index: number): ReadVerification<TValue> {
        if (index < 0 || index >= this.#propertyStubMetadata.reads.length) {
            throw new Error(
                `Read index ${index} is out of bounds. There are only ${this.#propertyStubMetadata.reads.length} reads.`
            );
        }
        return new ReadVerification(this.#propertyStubMetadata.reads[index]);
    }

    /**
     * Checks if the function was called and verifies the invocation count against a provided predicate.
     * @param invocationCountPredicate
     */
    wasCalled(invocationCountPredicate: (n: number) => boolean = it => it === 1): void {
        if (!invocationCountPredicate((this.#propertyStubMetadata as Stub<TValue & AnyFunction>[typeof stub]["interactionRecords"]).invocations.length)) {
            throw new Error(
                `Expected invocation count to pass predicate. (was called ${(this.#propertyStubMetadata as Stub<TValue & AnyFunction>[typeof stub]["interactionRecords"]).invocations.length} times)`
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
    nthInvocation(invocationIndex: number): InvocationVerification<TValue & AnyFunction> {
        if (invocationIndex < 0 || invocationIndex >= (this.#propertyStubMetadata as Stub<TValue & AnyFunction>[typeof stub]["interactionRecords"]).invocations.length) {
            throw new Error(
                `Invocation index ${invocationIndex} is out of bounds. There are only ${(this.#propertyStubMetadata as Stub<TValue & AnyFunction>[typeof stub]["interactionRecords"]).invocations.length} invocations.`
            );
        }
        const call = (this.#propertyStubMetadata as Stub<TValue & AnyFunction>[typeof stub]["interactionRecords"]).invocations[invocationIndex];
        return new InvocationVerification<TValue & AnyFunction>(call);
    }

    /**
     * Retrieves the verification for the first invocation of the function.
     */
    firstInvocation(): InvocationVerification<TValue & AnyFunction> {
        return this.nthInvocation(0);
    }

    /**
     * Retrieves the verification for the last invocation of the function.
     */
    lastInvocation(): InvocationVerification<TValue & AnyFunction> {
        return this.nthInvocation((this.#propertyStubMetadata as Stub<TValue & AnyFunction>[typeof stub]["interactionRecords"]).invocations.length - 1);
    }

    /**
     * Finds the first invocation that matches the provided predicate.
     * @param predicate - A function that tests the recorded information of each invocation
     */
    firstInvocationMatching(predicate: (invocationRecord: InvocationRecord<TValue & AnyFunction>) => boolean): InvocationVerification<TValue & AnyFunction> {
        const call = (this.#propertyStubMetadata as Stub<TValue & AnyFunction>[typeof stub]["interactionRecords"]).invocations.find(recordedCall => predicate(recordedCall)) ??
            _throw(new Error(`No invocation found matching the provided predicate.`));
        return new InvocationVerification(call);
    }

    /**
     * Finds the last invocation that matches the provided predicate.
     * @param predicate - A function that tests the recorded information of each invocation
     */
    lastInvocationMatching(predicate: (invocationRecord: InvocationRecord<TValue & AnyFunction>) => boolean): InvocationVerification<TValue & AnyFunction> {
        const reversedCalls = (this.#propertyStubMetadata as Stub<TValue & AnyFunction>[typeof stub]["interactionRecords"]).invocations.toReversed();
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
    allInvocationsMatching(predicate: (invocationRecord: InvocationRecord<TValue & AnyFunction>) => boolean): Array<InvocationVerification<TValue & AnyFunction>> {
        return (this.#propertyStubMetadata as Stub<TValue & AnyFunction>[typeof stub]["interactionRecords"]).invocations.filter(recordedCall => predicate(recordedCall)).map(call =>
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
    pickOverload<
        TOtherArgs extends Parameters<OverloadToUnion<TValue & AnyFunction>>,
        TOtherReturn = ReturnTypeForArgs<TValue & AnyFunction, TOtherArgs>
    >(): Verification<(...args: TOtherArgs) => TOtherReturn> {
        return new Verification<(...args: TOtherArgs) => TOtherReturn>(
            this.#propertyStubMetadata as never
        );
    }
}
