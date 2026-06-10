import { suite, test, type TestContext } from "node:test";
import { spy } from "./spy.js";
import { stub } from "./stub.js";
import { noop } from "./stubs/function/noop.js";
import { defaultValue } from "./stubs/property/default-value.js";
import { mock } from "./symbols.js";

await suite("spy", async () => {
    await test("should pass instanceof checks", (t: TestContext) => {
        t.plan(1);

        // Given
        // eslint-disable-next-line @typescript-eslint/no-extraneous-class
        class TestClass {
        }

        const realInstance = new TestClass();
        const spied = spy(realInstance);

        // When
        const isInstance = spied instanceof TestClass;

        // Then
        t.assert.equal(isInstance, true);
    });

    await test("should contain spy information", (t: TestContext) => {
        t.plan(1);

        // Given
        // eslint-disable-next-line @typescript-eslint/no-extraneous-class
        class TestClass {
        }

        const realInstance = new TestClass();
        const spied = spy(realInstance);

        // When
        const spyInfo = spied[mock];

        // Then
        t.assert.deepStrictEqual(spyInfo, { stubs: {} });
    });

    await test("should throw if unstubbed property is accessed", (t: TestContext) => {
        t.plan(1);

        // Given
        class TestClass {
            property = "value";
        }

        const realInstance = new TestClass();
        const spied = spy(realInstance);

        // Then
        t.assert.throws(() => {
            // When
            void (spied.property);
        }, { message: /No stub defined/ });
    });

    await test("should return property stub value", (t: TestContext) => {
        t.plan(1);

        // Given
        class TestClass {
            property = "initial";
        }

        const realInstance = new TestClass();
        const spied = spy(realInstance);
        stub(spied).property = defaultValue<TestClass, "property">("stubbed");

        // Then
        t.assert.strictEqual(spied.property, "stubbed");
    });

    await test("should allow setting value of a property stub", (t: TestContext) => {
        t.plan(1);

        // Given
        class TestClass {
            property = "initial";
        }

        const realInstance = new TestClass();
        const spied = spy(realInstance);
        stub(spied).property = defaultValue<TestClass, "property">("initial");

        // When
        spied.property = "updated";

        // Then
        t.assert.strictEqual(spied.property, "updated");
    });

    await test("should throw when setting value on a function stub", (t: TestContext) => {
        t.plan(1);

        // Given
        class TestClass {
            method(): void {}
        }

        const realInstance = new TestClass();
        const spied = spy(realInstance);
        stub(spied).method = noop<TestClass, "method", []>();

        // Then
        t.assert.throws(() => {
            // When
            Reflect.set(spied, "method", "value");
        }, { message: /Cannot set value of non-property stub "method"/ });
    });

    await test("should support 'in' operator via has trap", (t: TestContext) => {
        t.plan(2);

        // Given
        class TestClass {
            property = "value";
        }

        const realInstance = new TestClass();
        const spied = spy(realInstance);

        // Then
        t.assert.ok(mock in spied);
        t.assert.ok("property" in spied);
    });
});
