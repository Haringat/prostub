import { suite, test, type TestContext } from "node:test";
import { spy } from "./spy";
import { mock } from "./symbols";

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
});
