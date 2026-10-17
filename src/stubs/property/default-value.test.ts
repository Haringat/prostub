import { suite, test, type TestContext } from "node:test";
import { stub } from "../../symbols.js";
import { defaultValue } from "./default-value.js";

await suite("defaultValue", async () => {
    await test("should return initial value on read", (t: TestContext) => {
        t.plan(1);
        // Given
        class TestClass {
            prop = "";
        }
        const defaultStub = defaultValue<string>("initial");

        // When
        const result = defaultStub[stub].interactions.get(new TestClass());

        // Then
        t.assert.strictEqual(result, "initial");
    });

    await test("should allow setting and getting new value", (t: TestContext) => {
        t.plan(3);
        // Given
        class TestClass {
            prop = "";
        }
        const defaultStub = defaultValue<string>("initial");

        // When
        defaultStub[stub].interactions.set(new TestClass(), "updated");
        const result = defaultStub[stub].interactions.get(new TestClass());

        // Then
        t.assert.strictEqual(result, "updated");
        t.assert.strictEqual(defaultStub[stub].interactionRecords.writes.length, 1);
        t.assert.strictEqual(defaultStub[stub].interactionRecords.reads.length, 1);
    });

    await test("should persist value across multiple accesses", (t: TestContext) => {
        t.plan(4);
        // Given
        class TestClass {
            prop = 0;
        }
        const defaultStub = defaultValue<number>(10);

        // When
        defaultStub[stub].interactions.set(new TestClass(), 20);
        const result1 = defaultStub[stub].interactions.get(new TestClass());
        defaultStub[stub].interactions.set(new TestClass(), 30);
        const result2 = defaultStub[stub].interactions.get(new TestClass());

        // Then
        t.assert.strictEqual(result1, 20);
        t.assert.strictEqual(result2, 30);
        t.assert.strictEqual(defaultStub[stub].interactionRecords.writes.length, 2);
        t.assert.strictEqual(defaultStub[stub].interactionRecords.reads.length, 2);
    });

    await test("should track read and assignment operations", (t: TestContext) => {
        t.plan(2);
        // Given
        class TestClass {
            prop = "";
        }
        const defaultStub = defaultValue<string>("value");

        // When
        defaultStub[stub].interactions.get(new TestClass());
        defaultStub[stub].interactions.get(new TestClass());
        defaultStub[stub].interactions.set(new TestClass(), "new");

        // Then
        t.assert.strictEqual(defaultStub[stub].interactionRecords.reads.length, 2);
        t.assert.strictEqual(defaultStub[stub].interactionRecords.writes.length, 1);
    });
});
