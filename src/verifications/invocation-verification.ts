import type { InvocationRecord } from "../stubs/stub.js";
import { InteractionVerification } from "./interaction-verification.js";
import type { AnyFunction } from "../util/any-function.js";
import type {OverloadToUnion} from "../util/overload-to-union.js";
import type {PredicateTuple} from "../util/predicate-tuple.js";
import type {MethodArgs} from "../util/method-args.js";

export class InvocationVerification<const TValue extends AnyFunction> extends InteractionVerification<InvocationRecord<TValue>> {

    constructor(call: InvocationRecord<TValue>) {
        super(call);
    }

    /**
     * Checks the returned value against a provided validator function.
     * @param validator - A function that validates the returned value.
     */
    returned(validator: (result: ReturnType<OverloadToUnion<TValue>>) => boolean): void {
        if (this.interactionRecord.error) {
            throw new Error(`Expected invocation to return a value, but it threw an error.`);
        }
        if (!validator(this.interactionRecord.returnValue as ReturnType<OverloadToUnion<TValue>>)) {
            throw new Error(`The returned value did not satisfy the provided validator.`);
        }
    }

    /**
     * Checks the thrown error against a provided validator function.
     * @param validator - A function that validates the thrown error.
     */
    threw(validator: (error: unknown) => boolean): void {
        if (!this.interactionRecord.error) {
            throw new Error(`Expected invocation to throw an error, but it did not.`);
        }
        if (!validator(this.interactionRecord.error)) {
            throw new Error(`The thrown error did not satisfy the provided validator.`);
        }
    }

    /**
     * Checks that the invocation did not throw an error.
     */
    didNotThrow(): void {
        if (this.interactionRecord.error) {
            throw new Error(
                `Expected invocation to not throw an error, but it threw: ${this.interactionRecord.error}`
            );
        }
    }

    /**
     * Checks the invocation arguments against provided validators.
     * @param validators - An array of functions that validate each argument.
     */
    hadArguments(...validators: PredicateTuple<MethodArgs<TValue>>): void {
        const hasArguments = (validators as PredicateTuple<MethodArgs<TValue>> & Array<(it: unknown) => boolean>).every((validator, index) => validator(this.interactionRecord.args[index]));
        if (!hasArguments) {
            throw new Error(`The invocation arguments did not satisfy the provided validators.`);
        }
    }
}
