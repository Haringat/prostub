import {suite, test, type TestContext} from "node:test";
import {FunctionVerification} from "./function-verification";
import {InvocationVerification} from "./invocation-verification";

await suite("FunctionVerification", async () => {
    await suite("wasCalled", async () => {
        await suite("no verifier", async () => {
            await test("should verify method was called", (t: TestContext) => {
                t.plan(1);
                // Given
                const verification = new FunctionVerification({
                    calls: [ { args: [], returnValue: undefined, time: BigInt(Math.floor(performance.now() * 1000000)) } ]
                });

                // Then
                t.assert.doesNotThrow(() => {
                    // When
                    verification.wasCalled();
                });
            });

            await test("should throw when method was not called", (t: TestContext) => {
                t.plan(1);
                // Given
                const verification = new FunctionVerification({
                    calls: []
                });

                // Then
                t.assert.throws(() => verification.wasCalled(), {
                    message: /Expected invocation count to pass predicate. \(was called 0 times\)/
                });
            });
        });
        await suite("with verifier", async () => {
            await test("should not throw if invocation count matches verifier", (t: TestContext) => {
                t.plan(1);
                // Given
                const verification = new FunctionVerification({
                    calls: [
                        { args: [], returnValue: undefined, time: BigInt(Math.floor(performance.now() * 1000000)) },
                        { args: [], returnValue: undefined, time: BigInt(Math.floor(performance.now() * 1000000)) }
                    ]
                });

                // Then
                t.assert.doesNotThrow(() => {
                    // When
                    verification.wasCalled(it => it === 2);
                });
            });

            await test("should throw if invocation count does not match verifier", (t: TestContext) => {
                t.plan(1);
                // Given
                const verification = new FunctionVerification({
                    calls: [
                        { args: [], returnValue: undefined, time: BigInt(Math.floor(performance.now() * 1000000)) },
                        { args: [], returnValue: undefined, time: BigInt(Math.floor(performance.now() * 1000000)) }
                    ]
                });

                // Then
                t.assert.throws(() => {
                    // When
                    verification.wasCalled(it => it === 1);
                }, {
                    message: /Expected invocation count to pass predicate. \(was called 2 times\)/
                });
            });
        });
    });
    await suite("wasNotCalled", async () => {
        await test("should throw if the function was called at least once", async (t: TestContext) => {
            t.plan(1);
            // Given
            const verification = new FunctionVerification({
                calls: [ { args: [], returnValue: undefined, time: BigInt(Math.floor(performance.now() * 1000000)) } ]
            });

            // Then
            t.assert.throws(() => {
                // When
                verification.wasNotCalled();
            }, {
                message: /Expected invocation count to pass predicate. \(was called 1 times\)/
            });
        });
        await test("should not throw if the function was never called", async (t: TestContext) => {
            t.plan(1);
            // Given
            const verification = new FunctionVerification({
                calls: []
            });

            // Then
            t.assert.doesNotThrow(() => {
                // When
                verification.wasNotCalled();
            });
        });
    });
    await suite("wasCalledTimes", async () => {
        await test("should not throw if the function was called the expected number of times", async (t: TestContext) => {
            t.plan(1);
            // Given
            const verification = new FunctionVerification({
                calls: [
                    { args: [], returnValue: undefined, time: BigInt(Math.floor(performance.now() * 1000000)) },
                    { args: [], returnValue: undefined, time: BigInt(Math.floor(performance.now() * 1000000)) }
                ]
            });

            // Then
            t.assert.doesNotThrow(() => {
                // When
                verification.wasCalledTimes(2);
            });
        });
        await test("should throw if the function was called a different number of times", async (t: TestContext) => {
            t.plan(1);
            // Given
            const verification = new FunctionVerification({
                calls: [
                    { args: [], returnValue: undefined, time: BigInt(Math.floor(performance.now() * 1000000)) },
                    { args: [], returnValue: undefined, time: BigInt(Math.floor(performance.now() * 1000000)) }
                ]
            });

            // Then
            t.assert.throws(() => {
                // When
                verification.wasCalledTimes(1);
            }, {
                message: /Expected invocation count to pass predicate. \(was called 2 times\)/
            });
        });
    });
    await suite("nthInvocation", async () => {
        await test("should return the correct invocation verification for the given index", async (t: TestContext) => {
            t.plan(1);
            // Given
            const verification = new FunctionVerification({
                calls: [
                    { args: [1], returnValue: 2, time: 1000n },
                    { args: [3], returnValue: 4, time: 2000n }
                ]
            });

            // When
            const invocationVerification = verification.nthInvocation(1);

            // Then
            t.assert.deepStrictEqual(invocationVerification, new InvocationVerification({
                args: [3], returnValue: 4, time: 2000n
            }));
        });
        await test("should throw if there were fewer invocations than the given index", async (t: TestContext) => {
            t.plan(1);
            // Given
            const verification = new FunctionVerification({
                calls: [
                    { args: [1], returnValue: 2, time: 0n }
                ]
            });

            // Then
            t.assert.throws(() => {
                // When
                verification.nthInvocation(1);
            }, {
                message: /Invocation index 1 is out of bounds. There are only 1 invocations./
            });
        });
    });
    await suite("firstInvocation", async () => {
        await test("should return the first invocation verification", async (t: TestContext) => {
            t.plan(1);
            // Given
            const verification = new FunctionVerification({
                calls: [
                    { args: [1], returnValue: 2, time: 1000n },
                    { args: [3], returnValue: 4, time: 2000n }
                ]
            });

            // When
            const invocationVerification = verification.firstInvocation();

            // Then
            t.assert.deepStrictEqual(invocationVerification, new InvocationVerification({
                args: [1], returnValue: 2, time: 1000n
            }));
        });
        await test("should throw if there were no invocations", async (t: TestContext) => {
            t.plan(1);
            // Given
            const verification = new FunctionVerification({
                calls: []
            });

            // Then
            t.assert.throws(() => {
                // When
                verification.firstInvocation();
            }, {
                message: /Invocation index 0 is out of bounds. There are only 0 invocations./
            });
        });
    });
    await suite("lastInvocation", async () => {
        await test("should return the last invocation verification", async (t: TestContext) => {
            t.plan(1);
            // Given
            const verification = new FunctionVerification({
                calls: [
                    { args: [1], returnValue: 2, time: 1000n },
                    { args: [3], returnValue: 4, time: 2000n }
                ]
            });

            // When
            const invocationVerification = verification.lastInvocation();

            // Then
            t.assert.deepStrictEqual(invocationVerification, new InvocationVerification({
                args: [3], returnValue: 4, time: 2000n
            }));
        });
        await test("should throw if there were no invocations", async (t: TestContext) => {
            t.plan(1);
            // Given
            const verification = new FunctionVerification({
                calls: []
            });

            // Then
            t.assert.throws(() => {
                // When
                verification.lastInvocation();
            }, {
                message: /Invocation index -1 is out of bounds. There are only 0 invocations./
            });
        });
    });
    await suite("invocationMatching", async () => {
        await test("should pass the recorded arguments to the predicate", async (t: TestContext) => {
            t.plan(2);
            // Given
            const verification = new FunctionVerification({
                calls: [
                    { args: [1, 2], returnValue: 3, time: 0n }
                ]
            });

            // When
            verification.invocationMatching((arg0, arg1) => {
                // Then
                t.assert.strictEqual(arg0, 1);
                t.assert.strictEqual(arg1, 2);
                return true;
            });
        })
        await test("should return the correct invocation verification matching the predicate", async (t: TestContext) => {
            t.plan(1);
            // Given
            const verification = new FunctionVerification({
                calls: [
                    { args: [1], returnValue: 2, time: 1000n },
                    { args: [3], returnValue: 4, time: 2000n }
                ]
            });

            // When
            const invocationVerification = verification.invocationMatching(arg0 => arg0 === 3);

            // Then
            t.assert.deepStrictEqual(invocationVerification, new InvocationVerification({
                args: [3], returnValue: 4, time: 2000n
            }));
        });
        await test("should throw if no invocation matches the predicate", async (t: TestContext) => {
            t.plan(1);
            // Given
            const verification = new FunctionVerification({
                calls: [
                    { args: [1 as number], returnValue: 2, time: 0n },
                    { args: [3 as number], returnValue: 4, time: 0n }
                ]
            });

            // Then
            t.assert.throws(() => {
                // When
                verification.invocationMatching(arg0 => arg0 === 5);
            }, {
                message: /No invocation found matching the provided predicate./
            });
        });
    });
    await suite("firstInvocationMatching", async () => {
        await test("should pass the recorded invocation to the predicate", async (t: TestContext) => {
            t.plan(1);
            // Given
            const verification = new FunctionVerification({
                calls: [
                    {args: [1, 2], returnValue: 3, time: 1000n}
                ]
            });

            // When
            verification.firstInvocationMatching((invocationRecord) => {
                // Then
                t.assert.deepStrictEqual(invocationRecord, {
                    args: [1, 2],
                    returnValue: 3,
                    time: 1000n
                });
                return true;
            });
        })
        await test("should return the correct invocation verification matching the predicate", async (t: TestContext) => {
            t.plan(1);
            // Given
            const verification = new FunctionVerification({
                calls: [
                    {args: [1], returnValue: 2, time: 1000n},
                    {args: [3], returnValue: 4, time: 2000n}
                ]
            });

            // When
            const invocationVerification = verification.firstInvocationMatching(invocationRecord => invocationRecord.args[0] === 3);
            // Then
            t.assert.deepStrictEqual(invocationVerification, new InvocationVerification({
                args: [3], returnValue: 4, time: 2000n
            }));
        });
        await test("should throw if no invocation matches the predicate", async (t: TestContext) => {
            t.plan(1);
            // Given
            const verification = new FunctionVerification({
                calls: [
                    {args: [1 as number], returnValue: 2, time: 0n},
                    {args: [3 as number], returnValue: 4, time: 0n}
                ]
            });

            // Then
            t.assert.throws(() => {
                // When
                verification.firstInvocationMatching(invocationRecord => invocationRecord.args[0] === 5);
            }, {
                message: /No invocation found matching the provided predicate./
            });
        });
    });
});
