import type {AnyFunction} from "./util/any-function.js";
import {AssignmentVerification} from "./verifications/assignment-verification.js";
import {ReadVerification} from "./verifications/read-verification.js";
import {InvocationVerification} from "./verifications/invocation-verification.js";
import type {InvocationRecord} from "./stubs/stub.js";
import type {OverloadToUnion} from "./util/overload-to-union.js";
import type {ReturnTypeForArgs} from "./util/return-type-for-args.js";

export interface PropertyVerification<T> {
    /**
     * Checks the number of occurred reads against a fixed number.
     * @param expectedGetCallCount How many reads are expected to have occurred
     */
    wasReadNTimes(expectedGetCallCount?: number): void;
    /**
     * Checks the number of occurred reads against a predicate function.
     * @param readCountPredicate A predicate function that checks if the number of occurred reads matches the expectation
     */
    wasRead(readCountPredicate?: (n: number) => boolean): void;
    /**
     * Checks the number of occurred assignments against a predicate function.
     * @param writeCountPredicate A predicate function that checks if the number of occurred assignments matches the expectation
     */
    wasAssigned(writeCountPredicate?: (n: number) => boolean): void;
    /**
     * Checks if the property has never been assigned.
     */
    wasNotAssigned(): void;
    /**
     * Checks if the property has never been read.
     */
    wasNotRead(): void;
    /**
     * Checks the number of occurred assignments against a fixed number.
     * @param expectedSetCallCount How many assignments are expected to have occurred
     */
    wasAssignedNTimes(expectedSetCallCount?: number): void;
    /**
     * Gets the nth assignment verification.
     * @param index The zero-based index of the assignment to retrieve
     */
    nthAssignment(index: number): AssignmentVerification<T>;
    /**
     * Gets the first assignment verification.
     */
    firstAssignment(): AssignmentVerification<T>;
    /**
     * Gets the last assignment verification.
     */
    lastAssignment(): AssignmentVerification<T>;
    /**
     * Gets the first read verification.
     */
    firstRead(): ReadVerification<T>;
    /**
     * Gets the last read verification.
     */
    lastRead(): ReadVerification<T>;
    /**
     * Gets the nth read verification.
     * @param index The zero-based index of the read to retrieve
     */
    nthRead(index: number): ReadVerification<T>;
}

export interface MethodVerification<T extends AnyFunction> {
    /**
     * Checks if the function was called and verifies the invocation count against a provided predicate.
     * @param invocationCountPredicate
     */
    wasCalled(invocationCountPredicate?: (n: number) => boolean): void;
    /**
     * Checks if the function was never called.
     */
    wasNotCalled(): void;
    /**
     * Checks the number of times the function was called against an expected count.
     * @param expectedCallCount - The expected number of times the function should have been called.
     */
    wasCalledTimes(expectedCallCount: number): void;
    /**
     * Retrieves the verification for the nth invocation of the function.
     * @param invocationIndex
     */
    nthInvocation(invocationIndex: number): InvocationVerification<T>;
    /**
     * Retrieves the verification for the first invocation of the function.
     */
    firstInvocation(): InvocationVerification<T>;
    /**
     * Retrieves the verification for the last invocation of the function.
     */
    lastInvocation(): InvocationVerification<T>;
    /**
     * Finds the first invocation that matches the provided predicate.
     * @param predicate - A function that tests the recorded information of each invocation
     */
    firstInvocationMatching(predicate: (invocationRecord: InvocationRecord<T>) => boolean): InvocationVerification<T>;
    /**
     * Finds the last invocation that matches the provided predicate.
     * @param predicate - A function that tests the recorded information of each invocation
     */
    lastInvocationMatching(predicate: (invocationRecord: InvocationRecord<T>) => boolean): InvocationVerification<T>;
    /**
     * Finds all invocations that match the provided predicate.
     * @param predicate - A function that tests the recorded information of each invocation
     */
    allInvocationsMatching(predicate: (invocationRecord: InvocationRecord<T>) => boolean): Array<InvocationVerification<T>>;
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
    pickOverload<TOtherArgs extends Parameters<OverloadToUnion<T>>, TOtherReturn = ReturnTypeForArgs<T, TOtherArgs>>(): MethodVerification<(...args: TOtherArgs) => TOtherReturn>
}

export type ObjectVerification<T> = {
    readonly [TKey in keyof T]: PropertyVerification<T[TKey]> & (T[TKey] extends AnyFunction ? MethodVerification<T[TKey]> : object);
};
