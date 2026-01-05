import { suite, test, todo } from "node:test";
import type { InteractionRecord } from "../stubs/stub";
import { InteractionVerification } from "./interaction-verification";

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
                const readVerification = new TestVerification({time: 1000n});
                const otherReadVerification = new TestVerification({time: 2000n});

                // When
                t.assert.doesNotThrow(() => {
                    // When
                    readVerification.wasBefore(otherReadVerification);
                });
            });

            await test("should throw if the invocation was at the same time as the other one", async t => {
                t.plan(1);

                // Given
                const readVerification = new TestVerification({time: 1000n});
                const otherReadVerification = new TestVerification({time: 1000n});

                // When
                t.assert.throws(() => {
                    // When
                    readVerification.wasBefore(otherReadVerification);
                }, {
                    message:
                        "Expected interaction at 1000 to be before interaction at 1000, but it was not."
                });
            });

            await test("should throw if the invocation was after the other  one", async t => {
                t.plan(1);

                // Given
                const readVerification = new TestVerification({time: 2000n});
                const otherReadVerification = new TestVerification({time: 1000n});

                // Then
                t.assert.throws(() => {
                    // When
                    readVerification.wasBefore(otherReadVerification);
                }, {
                    message:
                        "Expected interaction at 2000 to be before interaction at 1000, but it was not."
                });
            });
        });

        await todo("with a specific point in time");
    });
    await suite("wasAfter", async () => {
        await suite("with another InteractionVerification", async () => {
            await todo("should not throw if the invocation was after the other one");
            await todo("should throw if the invocation was at the same time as the other one");
            await todo("should throw if the invocation was before the other one");
        });

        await todo("with a specific point in time");
    });
});
