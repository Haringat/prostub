import {InvocationVerification} from "./invocation-verification";
import {FunctionStubMetadata} from "./stubs/stub";

export class FunctionVerification<TArgs extends Array<unknown>, TReturn> {
    readonly #functionStubMetadata: FunctionStubMetadata<TArgs, TReturn>;

    constructor(functionStubMetadata: FunctionStubMetadata<TArgs, TReturn>) {
        this.#functionStubMetadata = functionStubMetadata;
    }

    wasCalled(): void {
        this.wasCalledTimes(1);
    }

    wasNotCalled(): void {
        this.wasCalledTimes(0);
    }

    wasCalledTimes(expectedCallCount: number): void {
        const actualCallCount = this.#functionStubMetadata.calls.length;
        if (actualCallCount !== expectedCallCount) {
            throw new Error(`Expected function to be called ${expectedCallCount} times, but was called ${actualCallCount} times.`);
        }
    }

    nthInvocation(invocationIndex: number): InvocationVerification<TArgs, TReturn> {
        if (invocationIndex < 0 || invocationIndex >= this.#functionStubMetadata.calls.length) {
            throw new Error(`Invocation index ${invocationIndex} is out of bounds. There are only ${this.#functionStubMetadata.calls.length} invocations.`);
        }
        const call = this.#functionStubMetadata.calls[invocationIndex];
        return new InvocationVerification<TArgs, TReturn>(call);
    }

    firstInvocation(): InvocationVerification<TArgs, TReturn> {
        return this.nthInvocation(0);
    }

    lastInvocation(): InvocationVerification<TArgs, TReturn> {
        return this.nthInvocation(this.#functionStubMetadata.calls.length - 1);
    }

    invocationMatching(predicate: (...args: TArgs) => boolean): InvocationVerification<TArgs, TReturn> {
        const call = this.#functionStubMetadata.calls.find(call => predicate(...call.args));
        if (!call) {
            throw new Error(`No invocation found matching the provided predicate.`);
        }
        return new InvocationVerification<TArgs, TReturn>(call);
    }
}
