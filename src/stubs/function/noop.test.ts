import { suite, test, type TestContext } from "node:test";
import { stub } from "../../symbols.js";
import { noop } from "./noop.js";

await suite("noop", async () => {
    await test("should return undefined", (t: TestContext) => {
        t.plan(1);
        // Given
        const noopStub = noop();

        // When
        const result = noopStub[stub].invoke({}, "someProperty" as keyof object);

        // Then
        t.assert.strictEqual(result, undefined);
    });

    await test("should return undefined regardless of arguments", (t: TestContext) => {
        t.plan(2);
        // Given
        const noopStub = noop();

        // When
        const result1 = noopStub[stub].invoke({}, "someProperty" as keyof object, 1, 2, 3);
        const result2 = noopStub[stub].invoke({}, "someProperty" as keyof object, "a", "b");

        // Then
        t.assert.strictEqual(result1, undefined);
        t.assert.strictEqual(result2, undefined);
    });
});
