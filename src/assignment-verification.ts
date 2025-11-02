import {AssignmentRecord} from "./stubs/stub";

export class AssignmentVerification<const TValue> {
    readonly #assignmentRecord: AssignmentRecord<TValue>;

    constructor(assignmentRecord: AssignmentRecord<TValue>) {
        this.#assignmentRecord = assignmentRecord;
    }

    wasBefore(otherAssignment: AssignmentVerification<TValue>): void {
        if (this.#assignmentRecord.assignmentTime >= otherAssignment.#assignmentRecord.assignmentTime) {
            throw new Error(`Expected assignment at ${this.#assignmentRecord.assignmentTime.toISOString()} to be before assignment at ${otherAssignment.#assignmentRecord.assignmentTime.toISOString()}, but it was not.`);
        }
    }

    wasAfter(otherAssignment: AssignmentVerification<TValue>): void {
        if (this.#assignmentRecord.assignmentTime <= otherAssignment.#assignmentRecord.assignmentTime) {
            throw new Error(`Expected assignment at ${this.#assignmentRecord.assignmentTime.toISOString()} to be after assignment at ${otherAssignment.#assignmentRecord.assignmentTime.toISOString()}, but it was not.`);
        }
    }

    hasValue(validator: (result: TValue) => boolean): void {
        if (!validator(this.#assignmentRecord.newValue)) {
            throw new Error(`The assigned value did not satisfy the provided validator.`);
        }
    }
}
