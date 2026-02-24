import { suite, test, type TestContext } from "node:test";
import { InvocationVerification } from "./invocation-verification.js";

await suite("InvocationVerification", async () => {
    await suite("returned", async () => {
        await test("should throw when the returned value does not match the predicate", (t: TestContext) => {
            t.plan(1);
            // Given
            const invocationVerification = new InvocationVerification({
                args: [],
                time: BigInt(Math.floor(performance.now() * 1000000)),
                returnValue: "actual"
            });

            // Then
            t.assert.throws(() => {
                // When
                invocationVerification.returned(it => it === "unexpected");
            }, { message: /did not satisfy/ });
        });

        await test("should not throw when the returned value matches the predicate", (t: TestContext) => {
            t.plan(1);

            // Given
            const invocationVerification = new InvocationVerification({
                args: [],
                time: BigInt(Math.floor(performance.now() * 1000000)),
                returnValue: "actual"
            });

            // Then
            t.assert.doesNotThrow(() => {
                // When
                invocationVerification.returned(it => it === "actual");
            });
        });
    });

    await suite("threw", async () => {
        await test("should throw if invocation did not throw", (t: TestContext) => {
            t.plan(1);

            // Given
            const invocationVerification = new InvocationVerification({ args: [], time: 0n, returnValue: "actual" });

            // Then
            t.assert.throws(() => {
                // When
                invocationVerification.threw(it => it instanceof Error && it.message === "test exception");
            }, { message: /Expected invocation to throw an exception, but it did not./ });
        });

        await test("should throw if thrown exception does not match predicate", (t: TestContext) => {
            t.plan(1);

            // Given
            const invocationVerification = new InvocationVerification({
                args: [],
                time: 0n,
                exception: new Error("unexpected exception")
            });

            // Then
            t.assert.throws(() => {
                // When
                invocationVerification.threw(it => it instanceof Error && it.message === "test exception");
            }, { message: /The thrown exception did not satisfy the provided validator./ });
        });

        await test("should not throw if thrown exception matches predicate", (t: TestContext) => {
            t.plan(1);

            // Given
            const invocationVerification = new InvocationVerification({
                args: [],
                time: 0n,
                exception: new Error("test exception")
            });

            // Then
            t.assert.doesNotThrow(() => {
                // When
                invocationVerification.threw(it => it instanceof Error && it.message === "test exception");
            }, { message: /.*/ });
        });
    });

    await suite("didNotThrow", async () => {
        await test("should not throw if invocation did not throw", (t: TestContext) => {
            t.plan(1);

            // When
            const invocationVerification = new InvocationVerification({ args: [], time: 0n });

            // Then
            t.assert.doesNotThrow(() => {
                invocationVerification.didNotThrow();
            });
        });
    });

    await suite("hadArguments", async () => {
    });
});
