import type { ReadRecord } from "../stubs/stub.js";
import { InteractionVerification } from "./interaction-verification.js";

/**
 * Verification class for read interactions.
 * @typeParam TValue The type of the value being read.
 */
export class ReadVerification<const TValue> extends InteractionVerification<ReadRecord<TValue>> {
    constructor(read: ReadRecord<TValue>) {
        super(read);
    }

    /**
     * Checks the read value against a provided validator function.
     * @param validator
     */
    hadValue(validator: (result: TValue) => boolean): void {
        if (!validator(this.interactionRecord.value)) {
            throw new Error(`The read value did not satisfy the provided validator.`);
        }
    }
}
