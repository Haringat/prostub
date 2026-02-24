import { suite, test, type TestContext } from "node:test";
import { stub } from "../../symbols.js";
import { callThrough } from "./call-through.js";

await suite("callThrough", async () => {
    await test("should invoke the real method on the object", (t: TestContext) => {
        t.plan(2);
        // Given
        const obj = { method: (x: number) => x * 2 };
        const callThroughStub = callThrough<typeof obj, "method", [number], number>();

        // When
        const result1 = callThroughStub[stub].invoke(obj, "method", 5);
        const result2 = callThroughStub[stub].invoke(obj, "method", 3);

        // Then
        t.assert.strictEqual(result1, 10);
        t.assert.strictEqual(result2, 6);
    });

    await test("should propagate thrown errors from real method", (t: TestContext) => {
        t.plan(1);
        // Given
        const obj = {
            method: () => {
                throw new Error("original error");
            }
        };
        const callThroughStub = callThrough<typeof obj, "method", [], void>();

        // Then
        t.assert.throws(
            // When
            () => callThroughStub[stub].invoke(obj, "method"),
            { message: /original error/ }
        );
    });

    await test("should preserve this context", (t: TestContext) => {
        t.plan(1);
        // Given
        const obj: { value: number; getValue: (this: typeof obj) => number; } = {
            value: 42,
            getValue: function() {
                return this.value;
            }
        };
        const callThroughStub = callThrough<typeof obj, "getValue", [], number>();

        // When
        const result = callThroughStub[stub].invoke(obj, "getValue");

        // Then
        t.assert.strictEqual(result, 42);
    });
});
