import { suite, test, type TestContext } from "node:test";
import { stub } from "../../symbols.js";
import { returnSerial } from "./return-serial.js";

await suite("returnSerial", async () => {
    await test("should return values in sequence", (t: TestContext) => {
        t.plan(3);
        // Given
        const serialStub = returnSerial(1, 2, 3);

        // When
        const result1 = serialStub[stub].interactions.get({})();
        const result2 = serialStub[stub].interactions.get({})();
        const result3 = serialStub[stub].interactions.get({})();

        // Then
        t.assert.strictEqual(result1, 1);
        t.assert.strictEqual(result2, 2);
        t.assert.strictEqual(result3, 3);
    });

    await test("should throw when exhausted", (t: TestContext) => {
        t.plan(1);
        // Given
        const serialStub = returnSerial(1, 2);
        serialStub[stub].interactions.get({})();
        serialStub[stub].interactions.get({})();

        // Then
        t.assert.throws(
            // When
            () => serialStub[stub].interactions.get({})(),
            { message: /No more values to return./ }
        );
    });

    await test("should work with single value", (t: TestContext) => {
        t.plan(1);
        // Given
        const serialStub = returnSerial(42);

        // When
        const result = serialStub[stub].interactions.get({})();

        // Then
        t.assert.strictEqual(result, 42);
    });
});
