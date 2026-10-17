import { suite, test, type TestContext } from "node:test";
import { stub } from "../../symbols.js";
import { throwOnCall } from "./throw-on-call.js";

await suite("throwOnCall", async () => {
    await test("should throw an error on invocation", (t: TestContext) => {
        t.plan(1);
        // Given
        const throwStub = throwOnCall(() => new Error("method was called"));

        // Then
        t.assert.throws(
            // When
            () => throwStub[stub].interactions.get({})(),
            { message: /method was called/ }
        );
    });

    await test("should throw custom errors", (t: TestContext) => {
        t.plan(1);
        // Given
        const customError = new Error("Custom error message");
        const throwStub = throwOnCall(() => customError);

        // Then
        t.assert.throws(
            // When
            () => throwStub[stub].interactions.get({})(),
            { message: /Custom error message/ }
        );
    });

    await test("should throw on every invocation", (t: TestContext) => {
        t.plan(2);
        // Given
        const throwStub = throwOnCall(() => new Error("error"));

        // Then
        t.assert.throws(() => throwStub[stub].interactions.get({})());
        t.assert.throws(() => throwStub[stub].interactions.get({})());
    });
});
