import type { PropertyStubMetadata } from "../stubs/stub.js";
import { AssignmentVerification } from "./assignment-verification.js";
import { ReadVerification } from "./read-verification.js";

/**
 * Provides verification methods for a spied or mocked property's interactions.
 */
export class PropertyVerification<const TValue> {
    readonly #propertyStubMetadata: PropertyStubMetadata<TValue>;

    constructor(propertyStubMetadata: PropertyStubMetadata<TValue>) {
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
    wasRead(readCountPredicate: (n: number) => boolean = it => it === 1) {
        const actualGetCallCount = this.#propertyStubMetadata.reads.length;
        if (!readCountPredicate(actualGetCallCount)) {
            throw new Error(`Expected read count to pass predicate. (was read ${actualGetCallCount} times)`);
        }
    }

    /**
     * Checks the number of occurred assignments against a predicate function.
     * @param writeCountPredicate A predicate function that checks if the number of occurred assignments matches the expectation
     */
    wasAssigned(writeCountPredicate: (n: number) => boolean = it => it === 1) {
        const actualSetCallCount = this.#propertyStubMetadata.assignments.length;
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
    nthAssignment(index: number) {
        if (index < 0 || index >= this.#propertyStubMetadata.assignments.length) {
            throw new Error(
                `Assignment index ${index} is out of bounds. There are only ${this.#propertyStubMetadata.assignments.length} assignments.`
            );
        }
        return new AssignmentVerification(this.#propertyStubMetadata.assignments[index]);
    }

    /**
     * Gets the first assignment verification.
     */
    firstAssignment() {
        return this.nthAssignment(0);
    }

    /**
     * Gets the last assignment verification.
     */
    lastAssignment(): AssignmentVerification<TValue> {
        return this.nthAssignment(this.#propertyStubMetadata.assignments.length - 1);
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
    nthRead(index: number) {
        if (index < 0 || index >= this.#propertyStubMetadata.reads.length) {
            throw new Error(
                `Read index ${index} is out of bounds. There are only ${this.#propertyStubMetadata.reads.length} reads.`
            );
        }
        return new ReadVerification(this.#propertyStubMetadata.reads[index]);
    }
}
