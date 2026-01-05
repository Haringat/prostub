import type { ArgumentPredicate } from "../argument-predicate";
import type { InvocationRecord } from "../stubs/stub";
import { InteractionVerification } from "./interaction-verification";

export class InvocationVerification<const TArgs extends Array<unknown>, TReturn>
    extends InteractionVerification<InvocationRecord<TArgs, TReturn>> {
    constructor(call: InvocationRecord<TArgs, TReturn>) {
        super(call);
    }

    /**
     * Checks the returned value against a provided validator function.
     * @param validator - A function that validates the returned value.
     */
    returned(validator: (result: TReturn) => boolean): void {
        if (this.interactionRecord.exception) {
            throw new Error(`Expected invocation to return a value, but it threw an exception.`);
        }
        if (!validator(this.interactionRecord.returnValue as TReturn)) {
            throw new Error(`The returned value did not satisfy the provided validator.`);
        }
    }

    /**
     * Checks the thrown exception against a provided validator function.
     * @param validator - A function that validates the thrown exception.
     */
    threw(validator: (error: unknown) => boolean): void {
        if (!this.interactionRecord.exception) {
            throw new Error(`Expected invocation to throw an exception, but it did not.`);
        }
        if (!validator(this.interactionRecord.exception)) {
            throw new Error(`The thrown exception did not satisfy the provided validator.`);
        }
    }

    /**
     * Checks that the invocation did not throw an exception.
     */
    didNotThrow(): void {
        if (this.interactionRecord.exception) {
            throw new Error(
                `Expected invocation to not throw an exception, but it threw: ${this.interactionRecord.exception}`
            );
        }
    }

    /**
     * Checks the invocation arguments against provided validators.
     * @param validators - An array of functions that validate each argument.
     */
    hadArguments(...validators: ArgumentPredicate<TArgs>): void {
        const hasArguments = validators.every((validator, index) => validator(this.interactionRecord.args[index]));
        if (!hasArguments) {
            throw new Error(`The invocation arguments did not satisfy the provided validators.`);
        }
    }
}
