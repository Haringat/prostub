import type { AssignmentRecord } from "../stubs/stub.js";
import { InteractionVerification } from "./interaction-verification.js";

/**
 * Provides verification methods for assignment interactions.
 * @typeParam TValue The type of the value being assigned.
 */
export class AssignmentVerification<const TValue> extends InteractionVerification<AssignmentRecord<TValue>> {
    constructor(assignmentRecord: AssignmentRecord<TValue>) {
        super(assignmentRecord);
    }

    /**
     * Checks if the assigned value satisfies the provided validator function.
     * @param validator - A function that validates the assigned value.
     */
    hasValue(validator: (result: TValue) => boolean): void {
        if (!validator(this.interactionRecord.newValue)) {
            throw new Error(`The assigned value did not satisfy the provided validator.`);
        }
    }
}
