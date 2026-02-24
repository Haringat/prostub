import { suite, test } from "node:test";
import { AssignmentVerification } from "./assignment-verification.js";

await suite("AssignmentVerification", async () => {
    await suite("hasValue", async () => {
        await test("should throw if the value does not match the predicate", async t => {
            t.plan(1);

            // Given
            const verification = new AssignmentVerification<number>({
                newValue: 1,
                time: BigInt(Math.floor(performance.now() * 1000000))
            });

            // Then
            t.assert.doesNotThrow(() => {
                // When
                verification.hasValue(it => it === 1);
            });
        });

        await test("should throw if the value does not match the predicate", async t => {
            t.plan(1);

            // Given
            const verification = new AssignmentVerification<number>({
                newValue: 1,
                time: BigInt(Math.floor(performance.now() * 1000000))
            });

            // Then
            t.assert.throws(() => {
                verification.hasValue(it => it === 2);
            });
        });
    });
});
