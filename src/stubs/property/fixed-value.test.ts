import { suite, test, type TestContext } from "node:test";
import { stub } from "../../symbols";
import { fixedValue } from "./fixed-value";

await suite("fixedValue", async () => {
    await test("should return the fixed value on each read", (t: TestContext) => {
        t.plan(3);
        // Given
        class TestClass {
            someProperty = "";
        }
        const fixedStub = fixedValue<TestClass, "someProperty">("fixed string");

        // When
        const result1 = fixedStub[stub].get(new TestClass(), "someProperty");
        const result2 = fixedStub[stub].get(new TestClass(), "someProperty");
        const result3 = fixedStub[stub].get(new TestClass(), "someProperty");

        // Then
        t.assert.strictEqual(result1, "fixed string");
        t.assert.strictEqual(result2, "fixed string");
        t.assert.strictEqual(result3, "fixed string");
    });

    await test("should work with different value types", (t: TestContext) => {
        t.plan(3);
        // Given
        class NumberClass {
            prop = 0;
        }
        class ObjectClass {
            prop: { x: number; y: number; } = { x: 0, y: 0 };
        }
        class NullableClass {
            prop = null;
        }
        const numberStub = fixedValue<NumberClass, "prop">(42);
        const objectStub = fixedValue<ObjectClass, "prop">({ x: 1, y: 2 });
        const nullStub = fixedValue<NullableClass, "prop">(null);

        // When
        const numberResult = numberStub[stub].get(new NumberClass(), "prop");
        const objectResult = objectStub[stub].get(new ObjectClass(), "prop");
        const nullResult = nullStub[stub].get(new NullableClass(), "prop");

        // Then
        t.assert.strictEqual(numberResult, 42);
        t.assert.deepStrictEqual(objectResult, { x: 1, y: 2 });
        t.assert.strictEqual(nullResult, null);
    });

    await test("should throw when attempting to set value", (t: TestContext) => {
        t.plan(1);
        // Given
        class TestClass {
            someProperty = "";
        }
        const fixedStub = fixedValue<TestClass, "someProperty">("immutable");

        // Then
        t.assert.throws(
            // When
            () => fixedStub[stub].set(new TestClass(), "someProperty", "new value"),
            { message: /Cannot set value of a fixedValue property stub/ }
        );
    });

    await test("should track read operations", (t: TestContext) => {
        t.plan(1);
        // Given
        class TestClass {
            someProperty = "";
        }
        const fixedStub = fixedValue<TestClass, "someProperty">("test");

        // When
        fixedStub[stub].get(new TestClass(), "someProperty");
        fixedStub[stub].get(new TestClass(), "someProperty");

        // Then
        t.assert.strictEqual(fixedStub[stub].metadata.reads.length, 2);
    });
});
