import { suite, test, type TestContext } from "node:test";
import { stub } from "../../symbols";
import { answer } from "./answer";

await suite("answer", async () => {
    await test("should pass through and record arguments", (t: TestContext) => {
        t.plan(2);
        // Given
        const answerStub = answer((x: number, y: number) => x + y);

        // When
        const result = answerStub[stub].invoke({}, "someProperty" as keyof object, 5, 3);

        // Then
        t.assert.strictEqual(result, 8);
        t.assert.partialDeepStrictEqual(answerStub[stub].metadata, { calls: [{ args: [5, 3] }] });
    });

    await test("should record and re-throw thrown errors", (t: TestContext) => {
        t.plan(2);
        // Given
        const answerError = new Error("answer error");
        const answerStub = answer(() => {
            throw answerError;
        });

        // Then
        t.assert.throws(
            // When
            () => answerStub[stub].invoke({}, "someProperty" as keyof object),
            { message: /answer error/ }
        );
        t.assert.partialDeepStrictEqual(answerStub[stub].metadata, { calls: [{ exception: answerError }] });
    });

    await test("should preserve this-context", (t: TestContext) => {
        t.plan(1);
        // Given
        const context = {};
        let actualThis: typeof context = {};
        const answerStub = answer(function(this: typeof context) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            actualThis = this;
        });

        // When
        answerStub[stub].invoke(context, "someProperty" as keyof object);

        // Then
        t.assert.strictEqual(actualThis, context);
    });
});
