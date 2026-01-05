import { suite, test, type TestContext } from "node:test";
import { stub } from "../../symbols";
import { delegateTo } from "./delegate-to";

await suite("delegateTo", async () => {
    await test("should delegate to another function", (t: TestContext) => {
        t.plan(2);
        // Given
        const delegateStub = delegateTo((x: number) => x * 3);

        // When
        const result1 = delegateStub[stub].invoke({}, "someProperty" as keyof object, 5);
        const result2 = delegateStub[stub].invoke({}, "someProperty" as keyof object, 2);

        // Then
        t.assert.strictEqual(result1, 15);
        t.assert.strictEqual(result2, 6);
    });

    await test("should pass all arguments to delegate function", (t: TestContext) => {
        t.plan(1);
        // Given
        const delegateStub = delegateTo((a: number, b: number, c: number) => a + b + c);

        // When
        const result = delegateStub[stub].invoke({}, "someProperty" as keyof object, 1, 2, 3);

        // Then
        t.assert.strictEqual(result, 6);
    });

    await test("should propagate errors from delegate function", (t: TestContext) => {
        t.plan(1);
        // Given
        const delegateStub = delegateTo(() => {
            throw new Error("delegate error");
        });

        // Then
        t.assert.throws(
            // When
            () => delegateStub[stub].invoke({}, "someProperty" as keyof object),
            { message: /delegate error/ }
        );
    });
});
