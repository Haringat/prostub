import { suite, test, type TestContext } from "node:test";
import { stub } from "../../symbols.js";
import { fixedValue } from "./fixed-value.js";

await suite("fixedValue", async () => {
    await test("should return the fixed value on each read", (t: TestContext) => {
        t.plan(3);
        // Given
        class TestClass {
            someProperty = "";
        }
        const fixedStub = fixedValue<string>("fixed string");

        // When
        const result1 = fixedStub[stub].interactions.get(new TestClass());
        const result2 = fixedStub[stub].interactions.get(new TestClass());
        const result3 = fixedStub[stub].interactions.get(new TestClass());

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
        const numberStub = fixedValue<number>(42);
        const objectStub = fixedValue<{ x: number; y: number; }>({ x: 1, y: 2 });
        const nullStub = fixedValue<null>(null);

        // When
        const numberResult = numberStub[stub].interactions.get(new NumberClass());
        const objectResult = objectStub[stub].interactions.get(new ObjectClass());
        const nullResult = nullStub[stub].interactions.get(new NullableClass());

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
        const fixedStub = fixedValue<string>("immutable");

        // Then
        t.assert.throws(
            // When
            () => fixedStub[stub].interactions.set(new TestClass(), "new value"),
            { message: /Cannot set the value of a fixedValue property stub/ }
        );
    });

    await test("should track read operations", (t: TestContext) => {
        t.plan(1);
        // Given
        class TestClass {
            someProperty = "";
        }
        const fixedStub = fixedValue<string>("test");

        // When
        fixedStub[stub].interactions.get(new TestClass());
        fixedStub[stub].interactions.get(new TestClass());

        // Then
        t.assert.strictEqual(fixedStub[stub].interactionRecords.reads.length, 2);
    });
});
