import { suite, test, type TestContext } from "node:test";
import { stub } from "../../symbols.js";
import { trackValue } from "./track-value.js";

await suite("trackValue", async () => {
    await test("should track reads from the real property", (t: TestContext) => {
        t.plan(1);
        // Given
        class TestClass {
            prop = "original";
        }
        const trackStub = trackValue<TestClass, "prop">();
        const instance = new TestClass();

        // When
        trackStub[stub].get(instance, "prop");
        trackStub[stub].get(instance, "prop");

        // Then
        t.assert.strictEqual(trackStub[stub].metadata.reads.length, 2);
    });

    await test("should track read values correctly", (t: TestContext) => {
        t.plan(2);
        // Given
        class TestClass {
            prop = 42;
        }
        const trackStub = trackValue<TestClass, "prop">();
        const instance = new TestClass();

        // When
        const result1 = trackStub[stub].get(instance, "prop");
        instance.prop = 100;
        const result2 = trackStub[stub].get(instance, "prop");

        // Then
        t.assert.strictEqual(result1, 42);
        t.assert.strictEqual(result2, 100);
    });

    await test("should track assignments to the real property", (t: TestContext) => {
        t.plan(2);
        // Given
        class TestClass {
            prop = "initial";
        }
        const trackStub = trackValue<TestClass, "prop">();
        const instance = new TestClass();

        // When
        trackStub[stub].set(instance, "prop", "updated");
        trackStub[stub].set(instance, "prop", "changed");

        // Then
        t.assert.strictEqual(trackStub[stub].metadata.assignments.length, 2);
        t.assert.strictEqual(instance.prop, "changed");
    });

    await test("should update real property when value is set", (t: TestContext) => {
        t.plan(1);
        // Given
        class TestClass {
            prop = 0;
        }
        const trackStub = trackValue<TestClass, "prop">();
        const instance = new TestClass();

        // When
        trackStub[stub].set(instance, "prop", 50);

        // Then
        t.assert.strictEqual(instance.prop, 50);
    });
});
