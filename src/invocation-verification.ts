import {InvocationRecord} from "./stubs/stub";
import {ArgumentPredicate} from "./argument-predicate";

export class InvocationVerification<const TArgs extends Array<unknown>, TReturn> {

    readonly #call: InvocationRecord<TArgs, TReturn>;

    constructor(call: InvocationRecord<TArgs, TReturn>) {
        this.#call = call;
    }

    wasBefore(otherInvocation: InvocationVerification<TArgs, TReturn>): void {
        if (this.#call.invocationTime >= otherInvocation.#call.invocationTime) {
            throw new Error(`Expected invocation at ${this.#call.invocationTime.toISOString()} to be before invocation at ${otherInvocation.#call.invocationTime.toISOString()}, but it was not.`);
        }
    }

    wasAfter(otherInvocation: InvocationVerification<TArgs, TReturn>): void {
        if (this.#call.invocationTime <= otherInvocation.#call.invocationTime) {
            throw new Error(`Expected invocation at ${this.#call.invocationTime.toISOString()} to be after invocation at ${otherInvocation.#call.invocationTime.toISOString()}, but it was not.`);
        }
    }

    returned(validator: (result: TReturn) => boolean): void {
        if (this.#call.exception) {
            throw new Error(`Expected invocation to return a value, but it threw an exception.`);
        }
        if (!validator(this.#call.returnValue as TReturn)) {
            throw new Error(`The returned value did not satisfy the provided validator.`);
        }
    }

    threw(validator: (error: unknown) => boolean): void {
        if (!this.#call.exception) {
            throw new Error(`Expected invocation to throw an exception, but it did not.`);
        }
        if (!validator(this.#call.exception)) {
            throw new Error(`The thrown exception did not satisfy the provided validator.`);
        }
    }

    didNotThrow(): void {
        if (this.#call.exception) {
            throw new Error(`Expected invocation to not throw an exception, but it threw: ${this.#call.exception}`);
        }
    }

    hadArguments(...validators: ArgumentPredicate<TArgs>): void {
        const hasArguments = validators.every((validator, index) => validator(this.#call.args[index]));
        if (!hasArguments) {
            throw new Error(`The invocation arguments did not satisfy the provided validators.`);
        }
    }

}
