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

        await test("should throw if the invocation threw an exception when checking return value", (t: TestContext) => {
            t.plan(1);

            // Given
            const invocationVerification = new InvocationVerification({
                args: [],
                time: 0n,
                exception: new Error("test exception")
            });

            // Then
            t.assert.throws(() => {
                // When
                invocationVerification.returned(it => it === "value");
            }, { message: /Expected invocation to return a value, but it threw an exception./ });
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

        await test("should throw if invocation threw an exception", (t: TestContext) => {
            t.plan(1);

            // Given
            const invocationVerification = new InvocationVerification({
                args: [],
                time: 0n,
                exception: new Error("test exception")
            });

            // Then
            t.assert.throws(() => {
                // When
                invocationVerification.didNotThrow();
            }, { message: /Expected invocation to not throw an exception, but it threw:/ });
        });
    });

    await suite("hadArguments", async () => {
        await test("should not throw if all arguments satisfy the validators", (t: TestContext) => {
            t.plan(1);

            // Given
            const invocationVerification = new InvocationVerification<[string, number], undefined>({
                args: ["hello", 42],
                time: 0n
            });

            // Then
            t.assert.doesNotThrow(() => {
                // When
                invocationVerification.hadArguments(it => it === "hello", it => it === 42);
            });
        });

        await test("should throw if an argument does not satisfy its validator", (t: TestContext) => {
            t.plan(1);

            // Given
            const invocationVerification = new InvocationVerification<[string, number], undefined>({
                args: ["hello", 42],
                time: 0n
            });

            // Then
            t.assert.throws(() => {
                // When
                invocationVerification.hadArguments(it => it === "world", it => it === 42);
            }, { message: "The invocation arguments did not satisfy the provided validators." });
        });

        await test("should not throw if there are no argument validators", (t: TestContext) => {
            t.plan(1);

            // Given
            const invocationVerification = new InvocationVerification<[], undefined>({ args: [], time: 0n });

            // Then
            t.assert.doesNotThrow(() => {
                // When
                invocationVerification.hadArguments();
            });
        });
    });
});
