import {AssignmentVerification} from "./assignment-verification";
import {PropertyStubMetadata} from "./stubs/stub";
import {ReadVerification} from "./read-verification";

export class PropertyVerification<const TValue> {
    readonly #propertyStubMetadata: PropertyStubMetadata<TValue>;

    constructor(propertyStubMetadata: PropertyStubMetadata<TValue>) {
        this.#propertyStubMetadata = propertyStubMetadata;
    }

    wasReadNTimes(expectedGetCallCount = 1): void {
        const actualGetCallCount = this.#propertyStubMetadata.reads.length;
        if (actualGetCallCount !== expectedGetCallCount) {
            throw new Error(`Expected property getter to be called ${expectedGetCallCount} times, but was called ${actualGetCallCount} times.`);
        }
    }

    wasRead(): void {
        this.wasReadNTimes(1);
    }

    wasNotAssigned(): void {
        this.wasAssignedNTimes(0);
    }

    wasNotRead(): void {
        this.wasReadNTimes(0);
    }

    wasAssignedNTimes(expectedSetCallCount = 1): void {
        const actualSetCallCount = this.#propertyStubMetadata.assignments.length;
        if (actualSetCallCount !== expectedSetCallCount) {
            throw new Error(`Expected property setter to be called ${expectedSetCallCount} times, but was called ${actualSetCallCount} times.`);
        }
    }

    wasAssigned(): void {
        this.wasAssignedNTimes(1);
    }

    nthAssignment(index: number) {
        if (index < 0 || index >= this.#propertyStubMetadata.assignments.length) {
            throw new Error(`Assignment index ${index} is out of bounds. There are only ${this.#propertyStubMetadata.assignments.length} assignments.`);
        }
        return new AssignmentVerification(this.#propertyStubMetadata.assignments[index]);
    }

    firstAssignment() {
        return this.nthAssignment(0);
    }

    lastAssignment(): AssignmentVerification<TValue> {
        return this.nthAssignment(this.#propertyStubMetadata.assignments.length - 1);
    }

    firstRead(): ReadVerification<TValue> {
        return this.nthRead(0);
    }

    lastRead(): ReadVerification<TValue> {
        return this.nthRead(this.#propertyStubMetadata.reads.length - 1);
    }

    nthRead(index: number) {
        if (index < 0 || index >= this.#propertyStubMetadata.reads.length) {
            throw new Error(`Read index ${index} is out of bounds. There are only ${this.#propertyStubMetadata.reads.length} reads.`);
        }
        return new ReadVerification(this.#propertyStubMetadata.reads[index]);
    }
}
