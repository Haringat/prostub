import type { InteractionRecord } from "../stubs/stub.js";

/**
 * Abstract base class for verifying interactions.
 * @typeParam TRecord The type of interaction record.
 */
export abstract class InteractionVerification<TRecord extends InteractionRecord> {
    protected readonly interactionRecord: TRecord;

    protected constructor(record: TRecord) {
        this.interactionRecord = record;
    }

    /**
     * Checks if this interaction occurred before another interaction.
     * @param otherInteractionVerification - The other interaction verification to compare against.
     */
    wasBefore(otherInteractionVerification: InteractionVerification<InteractionRecord>): void;
    /**
     * Checks if this interaction occurred before a specific point in time.
     * @param date - The point in time to compare against.
     */
    // eslint-disable-next-line @typescript-eslint/unified-signatures
    wasBefore(date: Date): void;
    wasBefore(otherInteractionVerificationOrDate: InteractionVerification<InteractionRecord> | Date): void {
        if (otherInteractionVerificationOrDate instanceof InteractionVerification) {
            const otherInteractionVerification = otherInteractionVerificationOrDate;
            if (this.interactionRecord.time >= otherInteractionVerification.interactionRecord.time) {
                throw new Error(
                    `Expected interaction at ${this.interactionRecord.time} to be before interaction at ${otherInteractionVerification.interactionRecord.time}, but it was not.`
                );
            }
        } else {
            const pointInTime = BigInt(otherInteractionVerificationOrDate.getTime() * 1000000);
            if (this.interactionRecord.time >= pointInTime) {
                throw new Error(
                    `Expected interaction at ${this.interactionRecord.time} to be before ${pointInTime}, but it was not.`
                );
            }
        }
    }

    /**
     * Checks if this interaction occurred after another interaction.
     * @param otherInteractionVerification - The other interaction verification to compare against.
     */
    wasAfter(otherInteractionVerification: InteractionVerification<InteractionRecord>): void;
    /**
     * Checks if this interaction occurred after a specific point in time.
     * @param date - The point in time to compare against.
     */
    // eslint-disable-next-line @typescript-eslint/unified-signatures
    wasAfter(date: Date): void;
    wasAfter(otherInteractionVerificationOrDate: InteractionVerification<InteractionRecord> | Date): void {
        if (otherInteractionVerificationOrDate instanceof InteractionVerification) {
            if (this.interactionRecord.time <= otherInteractionVerificationOrDate.interactionRecord.time) {
                throw new Error(
                    `Expected interaction at ${this.interactionRecord.time} to be after interaction at ${otherInteractionVerificationOrDate.interactionRecord.time}, but it was not.`
                );
            }
        } else {
            const date = BigInt(otherInteractionVerificationOrDate.getTime() * 1000000);
            if (this.interactionRecord.time <= date) {
                throw new Error(
                    `Expected interaction at ${this.interactionRecord.time} to be after ${date}, but it was not.`
                );
            }
        }
    }
}
