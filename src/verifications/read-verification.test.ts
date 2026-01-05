import { suite, test } from "node:test";
import { ReadVerification } from "./read-verification";

await suite("ReadVerification", async () => {
    await suite("hadValue", async () => {
        await test("should not throw if the value does matches the predicate", async t => {
            t.plan(1);

            // Given
            const verification = new ReadVerification<number>({ value: 1, time: BigInt(Math.floor(performance.now() * 1000000)) });

            // Then
            t.assert.doesNotThrow(() => {
                // When
                verification.hadValue(it => it === 1);
            });
        });

        await test("should throw if the value does not match the predicate", async t => {
            t.plan(1);

            // Given
            const verification = new ReadVerification<number>({ value: 1, time: BigInt(Math.floor(performance.now() * 1000000)) });

            // Then
            t.assert.throws(() => {
                verification.hadValue(it => it === 2);
            }, { message: "The read value did not satisfy the provided validator." });
        });
    });
});
