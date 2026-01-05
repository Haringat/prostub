import { suite, test, type TestContext } from "node:test";
import { stub } from "../../symbols";
import { returnFixed } from "./return-fixed";
import { when } from "./when";

await suite("when", async () => {
    await test("should match arguments and return appropriate stub", (t: TestContext) => {
        t.plan(2);
        // Given
        class TestClass {
            getValue(_n: number): number {
                return 0;
            }
        }
        const whenStub = when<TestClass, "getValue", [number], number>((n: number) => n > 10)
            .then(returnFixed(100))
            .when((n: number) => n <= 10)
            .then(returnFixed(50));

        // When
        const result1 = whenStub[stub].invoke(new TestClass(), "getValue", 15);
        const result2 = whenStub[stub].invoke(new TestClass(), "getValue", 5);

        // Then
        t.assert.strictEqual(result1, 100);
        t.assert.strictEqual(result2, 50);
    });

    await test("should throw when no matching predicate", (t: TestContext) => {
        t.plan(1);
        // Given
        class TestClass {
            getValue(_n: number): number {
                return 0;
            }
        }
        const whenStub = when<TestClass, "getValue", [number], number>((n: number) => n > 10).then(returnFixed(100));

        // Then
        t.assert.throws(
            // When
            () => whenStub[stub].invoke(new TestClass(), "getValue", 5),
            { message: /No matching stub found/ }
        );
    });

    await test("should handle multiple conditions in order", (t: TestContext) => {
        t.plan(3);
        // Given
        class TestClass {
            getValue(_n: number): number {
                return 0;
            }
        }
        const whenStub = when<TestClass, "getValue", [number], number>((n: number) => n > 20)
            .then(returnFixed(200))
            .when((n: number) => n > 10)
            .then(returnFixed(100))
            .when((n: number) => n > 0)
            .then(returnFixed(50));

        // When
        const result1 = whenStub[stub].invoke(new TestClass(), "getValue", 25);
        const result2 = whenStub[stub].invoke(new TestClass(), "getValue", 15);
        const result3 = whenStub[stub].invoke(new TestClass(), "getValue", 5);

        // Then
        t.assert.strictEqual(result1, 200);
        t.assert.strictEqual(result2, 100);
        t.assert.strictEqual(result3, 50);
    });
});
