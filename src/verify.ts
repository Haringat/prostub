import {mock, stub as stubSymbol} from "./symbols";
import {FunctionStubMetadata, PropertyStubMetadata, Stub} from "./stubs/stub";
import {Verifiable} from "./verifiable";
import {PropertyVerification} from "./property-verification";
import {FunctionVerification} from "./function-verification";

export function verify<const TObject extends object>(mockOrSpy: TObject & {[mock]: {stubs: {-readonly [TKey in keyof TObject]?: Stub<TObject, TKey>}}}): Verifiable<TObject> {
    return new Proxy({} as Verifiable<TObject>, {
        get<TKey extends PropertyKey>(_target: Verifiable<TObject>, propertyName: TKey, _receiver: unknown): any {
            if (!mockOrSpy[mock].stubs.hasOwnProperty(propertyName)) {
                throw new Error(`No stub defined for property "${String(propertyName)}".`);
            }
            type MemberType = TObject[TKey & keyof TObject];
            const stub = mockOrSpy[mock].stubs[propertyName as TKey & keyof TObject];
            const stubMetadata = stub![stubSymbol];
            if (stubMetadata.type === "function") {
                type MemberFunctionArgs = MemberType extends (...args: infer TArgs) => any ? TArgs : never;
                type MemberFunctionReturn = MemberType extends (...args: any[]) => infer TReturn ? TReturn : never;
                return new FunctionVerification<MemberFunctionArgs, MemberFunctionReturn>(stubMetadata.metadata as FunctionStubMetadata<MemberFunctionArgs, MemberFunctionReturn>);
            } else {
                return new PropertyVerification<MemberType>(stubMetadata.metadata as PropertyStubMetadata<MemberType>);
            }
        }
    });
}
