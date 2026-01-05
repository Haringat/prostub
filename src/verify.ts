import type { FunctionStubMetadata, Mock, PropertyStubMetadata } from "./stubs/stub";
import { mock as mockSymbol, stub as stubSymbol } from "./symbols";
import type { Verification } from "./verification";
import { FunctionVerification } from "./verifications/function-verification";
import { PropertyVerification } from "./verifications/property-verification";
import type {spy} from "./spy";
import type {mock} from "./mock";
import type {stub} from "./stub";

/**
 * starts a stub verification. The Verification API always follows the pattern `verify(<mockOrSpy>).<member>.<verification>`.
 * @param mockOrSpy
 * @returns A proxy that provides access to the verification API for the specified mock or spy.
 * @example
 * ```ts
 * verify(myMock).someMethod.firstInvocation().didNotThrow();
 * ```
 *
 * @see {@link FunctionVerification} for function call verifications.
 * @see {@link PropertyVerification} for property interaction verifications.
 * @see {@link spy} for creating spies on real instances.
 * @see {@link mock} for creating mock instances of classes.
 * @see {@link stub} for stubbing methods and properties on the mock.
 */
export function verify<const TObject extends object>(mockOrSpy: Mock<TObject>): Verification<TObject> {
    return new Proxy({} as Verification<TObject>, {
        get<TKey extends PropertyKey>(_target: Verification<TObject>, propertyName: TKey, _receiver: unknown): unknown {
            if (!mockOrSpy[mockSymbol].stubs.hasOwnProperty(propertyName)) {
                throw new Error(`No stub defined for property "${String(propertyName)}".`);
            }
            type MemberType = TObject[TKey & keyof TObject];
            const stub = mockOrSpy[mockSymbol].stubs[propertyName as TKey & keyof TObject];
            // We verified the presence above, so this non-null-assertion is safe.
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const stubMetadata = stub![stubSymbol];
            if (stubMetadata.type === "function") {
                type MemberFunctionArgs = MemberType extends (...args: infer TArgs) => unknown ? TArgs : never;
                type MemberFunctionReturn = MemberType extends (...args: Array<unknown>) => infer TReturn ? TReturn :
                    never;
                return new FunctionVerification<MemberFunctionArgs, MemberFunctionReturn>(
                    stubMetadata.metadata as FunctionStubMetadata<MemberFunctionArgs, MemberFunctionReturn>
                );
            } else {
                return new PropertyVerification<MemberType>(stubMetadata.metadata as PropertyStubMetadata<MemberType>);
            }
        }
    });
}
