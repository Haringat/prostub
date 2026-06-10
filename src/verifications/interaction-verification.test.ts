import { suite, test } from "node:test";
import type { InteractionRecord } from "../stubs/stub.js";
import { InteractionVerification } from "./interaction-verification.js";

await suite("InteractionVerification", async () => {
    class TestVerification extends InteractionVerification<InteractionRecord> {
        public constructor(record: InteractionRecord) {
            super(record);
        }
    }

    await suite("wasBefore", async () => {
        await suite("with another InteractionVerification", async () => {
            await test("should not throw if the invocation was before the other one", async t => {
                t.plan(1);

                // Given
                const readVerification = new TestVerification({ time: 1000n });
                const otherReadVerification = new TestVerification({ time: 2000n });

                // When
                t.assert.doesNotThrow(() => {
                    // When
                    readVerification.wasBefore(otherReadVerification);
                });
            });

            await test("should throw if the invocation was at the same time as the other one", async t => {
                t.plan(1);

                // Given
                const readVerification = new TestVerification({ time: 1000n });
                const otherReadVerification = new TestVerification({ time: 1000n });

                // When
                t.assert.throws(() => {
                    // When
                    readVerification.wasBefore(otherReadVerification);
                }, { message: "Expected interaction at 1000 to be before interaction at 1000, but it was not." });
            });

            await test("should throw if the invocation was after the other  one", async t => {
                t.plan(1);

                // Given
                const readVerification = new TestVerification({ time: 2000n });
                const otherReadVerification = new TestVerification({ time: 1000n });

                // Then
                t.assert.throws(() => {
                    // When
                    readVerification.wasBefore(otherReadVerification);
                }, { message: "Expected interaction at 2000 to be before interaction at 1000, but it was not." });
            });
        });

        await suite("with a specific point in time", async () => {
            await test("should not throw if the invocation was before the date", async t => {
                t.plan(1);

                // Given - time 1000n nanoseconds, date at 1ms = 1000000n nanoseconds
                const verification = new TestVerification({ time: 1000n });
                const futureDate = new Date(1);

                // Then
                t.assert.doesNotThrow(() => {
                    // When
                    verification.wasBefore(futureDate);
                });
            });

            await test("should throw if the invocation was not before the date", async t => {
                t.plan(1);

                // Given - time 2000000n nanoseconds, date at 1ms = 1000000n nanoseconds
                const verification = new TestVerification({ time: 2000000n });
                const pastDate = new Date(1);

                // Then
                t.assert.throws(() => {
                    // When
                    verification.wasBefore(pastDate);
                }, { message: "Expected interaction at 2000000 to be before 1000000, but it was not." });
            });
        });
    });
    await suite("wasAfter", async () => {
        await suite("with another InteractionVerification", async () => {
            await test("should not throw if the invocation was after the other one", async t => {
                t.plan(1);

                // Given
                const verification = new TestVerification({ time: 2000n });
                const otherVerification = new TestVerification({ time: 1000n });

                // Then
                t.assert.doesNotThrow(() => {
                    // When
                    verification.wasAfter(otherVerification);
                });
            });

            await test("should throw if the invocation was at the same time as the other one", async t => {
                t.plan(1);

                // Given
                const verification = new TestVerification({ time: 1000n });
                const otherVerification = new TestVerification({ time: 1000n });

                // Then
                t.assert.throws(() => {
                    // When
                    verification.wasAfter(otherVerification);
                }, { message: "Expected interaction at 1000 to be after interaction at 1000, but it was not." });
            });

            await test("should throw if the invocation was before the other one", async t => {
                t.plan(1);

                // Given
                const verification = new TestVerification({ time: 1000n });
                const otherVerification = new TestVerification({ time: 2000n });

                // Then
                t.assert.throws(() => {
                    // When
                    verification.wasAfter(otherVerification);
                }, { message: "Expected interaction at 1000 to be after interaction at 2000, but it was not." });
            });
        });

        await suite("with a specific point in time", async () => {
            await test("should not throw if the invocation was after the date", async t => {
                t.plan(1);

                // Given - time 2000000n nanoseconds, date at 1ms = 1000000n nanoseconds
                const verification = new TestVerification({ time: 2000000n });
                const pastDate = new Date(1);

                // Then
                t.assert.doesNotThrow(() => {
                    // When
                    verification.wasAfter(pastDate);
                });
            });

            await test("should throw if the invocation was not after the date", async t => {
                t.plan(1);

                // Given - time 1000n nanoseconds, date at 1ms = 1000000n nanoseconds
                const verification = new TestVerification({ time: 1000n });
                const futureDate = new Date(1);

                // Then
                t.assert.throws(() => {
                    // When
                    verification.wasAfter(futureDate);
                }, { message: "Expected interaction at 1000 to be after 1000000, but it was not." });
            });
        });
    });
});
