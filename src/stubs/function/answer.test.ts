import { suite, test, type TestContext } from "node:test";
import { stub } from "../../symbols.js";
import { answer } from "./answer.js";

await suite("answer", async () => {
    await test("should pass through and record arguments", (t: TestContext) => {
        t.plan(2);
        // Given
        const answerStub = answer<(x: number, y: number) => number>((x: number, y: number) => x + y);

        // When
        const result = answerStub[stub].interactions.get({})(5, 3);

        // Then
        t.assert.strictEqual(result, 8);
        t.assert.partialDeepStrictEqual(answerStub[stub].interactionRecords.invocations, [
            {
                args: [5, 3]
            }
        ]);
    });

    await test("should record and re-throw thrown errors", (t: TestContext) => {
        t.plan(2);
        // Given
        const answerError = new Error("answer error");
        const answerStub = answer<() => void>(() => {
            throw answerError;
        });

        // Then
        t.assert.throws(
            // When
            () => answerStub[stub].interactions.get({})(),
            { message: /answer error/ }
        );
        t.assert.partialDeepStrictEqual(answerStub[stub].interactionRecords.invocations, [{ error: answerError }]);
    });

});
