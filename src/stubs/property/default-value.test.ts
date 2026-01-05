import { suite, test, type TestContext } from "node:test";
import { stub } from "../../symbols";
import { defaultValue } from "./default-value";

await suite("defaultValue", async () => {
    await test("should return initial value on read", (t: TestContext) => {
        t.plan(1);
        // Given
        class TestClass {
            prop = "";
        }
        const defaultStub = defaultValue<TestClass, "prop">("initial");

        // When
        const result = defaultStub[stub].get(new TestClass(), "prop");

        // Then
        t.assert.strictEqual(result, "initial");
    });

    await test("should allow setting and getting new value", (t: TestContext) => {
        t.plan(2);
        // Given
        class TestClass {
            prop = "";
        }
        const defaultStub = defaultValue<TestClass, "prop">("initial");

        // When
        defaultStub[stub].set(new TestClass(), "prop", "updated");
        const result = defaultStub[stub].get(new TestClass(), "prop");

        // Then
        t.assert.strictEqual(result, "updated");
        t.assert.strictEqual(defaultStub[stub].metadata.assignments.length, 1);
    });

    await test("should persist value across multiple accesses", (t: TestContext) => {
        t.plan(3);
        // Given
        class TestClass {
            prop = 0;
        }
        const defaultStub = defaultValue<TestClass, "prop">(10);

        // When
        defaultStub[stub].set(new TestClass(), "prop", 20);
        const result1 = defaultStub[stub].get(new TestClass(), "prop");
        defaultStub[stub].set(new TestClass(), "prop", 30);
        const result2 = defaultStub[stub].get(new TestClass(), "prop");

        // Then
        t.assert.strictEqual(result1, 20);
        t.assert.strictEqual(result2, 30);
        t.assert.strictEqual(defaultStub[stub].metadata.assignments.length, 2);
    });

    await test("should track read and assignment operations", (t: TestContext) => {
        t.plan(2);
        // Given
        class TestClass {
            prop = "";
        }
        const defaultStub = defaultValue<TestClass, "prop">("value");

        // When
        defaultStub[stub].get(new TestClass(), "prop");
        defaultStub[stub].get(new TestClass(), "prop");
        defaultStub[stub].set(new TestClass(), "prop", "new");

        // Then
        t.assert.strictEqual(defaultStub[stub].metadata.reads.length, 2);
        t.assert.strictEqual(defaultStub[stub].metadata.assignments.length, 1);
    });
});
