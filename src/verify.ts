import type { mock } from "./mock.js";
import type { spy } from "./spy.js";
import type { stub } from "./stub.js";
import type { Mock, Spy } from "./stubs/stub.js";
import { mock as mockSymbol, stub as stubSymbol } from "./symbols.js";
import type { ObjectVerification } from "./object-verification.js";
import { Verification } from "./verifications/verification.js";

/**
 * starts stub verification. The Verification API always follows the pattern `verify(<mockOrSpy>).<member>.<verification>`.
 * @param mockOrSpy
 * @returns A proxy that provides access to the verification API for the specified mock or spy.
 * @example
 * ```ts
 * verify(myMock).someMethod.firstInvocation().didNotThrow();
 * ```
 *
 * @see {@link Verification} for property interaction verifications.
 * @see {@link spy} for creating spies on real instances.
 * @see {@link mock} for creating mock instances of classes.
 * @see {@link stub} for stubbing methods and properties on the mock.
 */
export function verify<const TObject extends object>(mockOrSpy: Mock<TObject> | Spy<TObject>): ObjectVerification<TObject> {
    return new Proxy({} as ObjectVerification<TObject>, {
        get<TKey extends PropertyKey>(_target: ObjectVerification<TObject>, propertyName: TKey, _receiver: unknown): unknown {
            if (!mockOrSpy[mockSymbol].stubs.hasOwnProperty(propertyName)) {
                throw new Error(`No stub defined for property "${String(propertyName)}".`);
            }
            type MemberType = TObject[TKey & keyof TObject];
            const stub = mockOrSpy[mockSymbol].stubs[propertyName as TKey & keyof TObject];
            // We verified the presence above, so this non-null-assertion is safe.
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const stubMetadata = stub![stubSymbol];
            return new Verification<MemberType>(stubMetadata.interactionRecords);
        }
    });
}
