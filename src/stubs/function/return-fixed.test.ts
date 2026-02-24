import { suite, test, type TestContext } from "node:test";
import { stub } from "../../symbols.js";
import { returnFixed } from "./return-fixed.js";

await suite("returnFixed", async () => {
    await test("should return the fixed value on each invocation", (t: TestContext) => {
        t.plan(3);
        // Given
        const fixedStub = returnFixed(42);

        // When
        const result1 = fixedStub[stub].invoke({}, "someProperty" as keyof object);
        const result2 = fixedStub[stub].invoke({}, "someProperty" as keyof object);
        const result3 = fixedStub[stub].invoke({}, "someProperty" as keyof object);

        // Then
        t.assert.strictEqual(result1, 42);
        t.assert.strictEqual(result2, 42);
        t.assert.strictEqual(result3, 42);
    });

    await test("should work with different return types", (t: TestContext) => {
        t.plan(3);
        // Given
        const stringStub = returnFixed("fixed string");
        const objectStub = returnFixed({ x: 42 });
        const nullStub = returnFixed(null);

        // When
        const stringResult = stringStub[stub].invoke({}, "someProperty" as keyof object);
        const objectResult = objectStub[stub].invoke({}, "someProperty" as keyof object);
        const nullResult = nullStub[stub].invoke({}, "someProperty" as keyof object);

        // Then
        t.assert.strictEqual(stringResult, "fixed string");
        t.assert.deepStrictEqual(objectResult, { x: 42 });
        t.assert.strictEqual(nullResult, null);
    });

    await test("should ignore call arguments", (t: TestContext) => {
        t.plan(2);
        // Given
        const fixedStub = returnFixed(100);

        // When
        const resultWithArgs1 = fixedStub[stub].invoke({}, "someProperty" as keyof object, 1, 2, 3);
        const resultWithArgs2 = fixedStub[stub].invoke({}, "someProperty" as keyof object, "a", "b");

        // Then
        t.assert.strictEqual(resultWithArgs1, 100);
        t.assert.strictEqual(resultWithArgs2, 100);
    });
});
