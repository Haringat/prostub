import { suite, test, type TestContext } from "node:test";
import { stub } from "../../symbols.js";
import { noop } from "./noop.js";

await suite("noop", async () => {
    await test("should return undefined on each call", (t: TestContext) => {
        t.plan(3);
        // Given
        const noopStub = noop();

        // When
        const result1 = noopStub[stub].interactions.get({})();
        const result2 = noopStub[stub].interactions.get({})();
        const result3 = noopStub[stub].interactions.get({})();

        // Then
        t.assert.strictEqual(result1, undefined);
        t.assert.strictEqual(result2, undefined);
        t.assert.strictEqual(result3, undefined);
    });

    await test("should return undefined regardless of arguments", (t: TestContext) => {
        t.plan(2);
        // Given
        const noopStub = noop<(a?: string, b?: string) => undefined>();

        // When
        const result1 = noopStub[stub].interactions.get({})();
        const result2 = noopStub[stub].interactions.get({})("a", "b");

        // Then
        t.assert.strictEqual(result1, undefined);
        t.assert.strictEqual(result2, undefined);
    });
});
