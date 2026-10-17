import { suite, test, type TestContext } from "node:test";
import { mock } from "./mock.js";
import { stub } from "./stub.js";
import { fixedValue } from "./stubs/property/fixed-value.js";
import { verify } from "./verify.js";
import { Verification } from "./verifications/verification.js";

await suite("verify", async () => {
    await test("should throw when verifying a property with no stub defined", (t: TestContext) => {
        t.plan(1);

        // Given
        class TestClass {
            method() {}
        }

        const mockInstance = mock(TestClass);

        // Then
        t.assert.throws(() => {
            // When
            void (verify(mockInstance).method);
        }, { message: /No stub defined for property "method"/ });
    });

    await test("should return PropertyVerification for a property stub", (t: TestContext) => {
        t.plan(1);

        // Given
        class TestClass {
            property = "value";
        }

        const mockInstance = mock(TestClass);
        stub(mockInstance).property.override(fixedValue<string>("stubbed"));

        // When
        const result = verify(mockInstance).property;

        // Then
        t.assert.ok(result instanceof Verification);
    });
});
