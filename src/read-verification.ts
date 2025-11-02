import {ReadRecord} from "./stubs/stub";

export class ReadVerification<const TValue> {

    readonly #readRecord: ReadRecord<TValue>;

    constructor(read: ReadRecord<TValue>) {
        this.#readRecord = read;
    }

    wasBefore(otherRead: ReadVerification<TValue>): void {
        if (this.#readRecord.readTime >= otherRead.#readRecord.readTime) {
            throw new Error(`Expected read at ${this.#readRecord.readTime.toISOString()} to be before read at ${otherRead.#readRecord.readTime.toISOString()}, but it was not.`);
        }
    }

    wasAfter(otherRead: ReadVerification<TValue>): void {
        if (this.#readRecord.readTime <= otherRead.#readRecord.readTime) {
            throw new Error(`Expected read at ${this.#readRecord.readTime.toISOString()} to be after read at ${otherRead.#readRecord.readTime.toISOString()}, but it was not.`);
        }
    }

    hadValue(validator: (result: TValue) => boolean): void {
        if (!validator(this.#readRecord.value)) {
            throw new Error(`The read value did not satisfy the provided validator.`);
        }
    }

}
