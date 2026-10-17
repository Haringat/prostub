import { suite, test, type TestContext } from "node:test";
import { mock } from "./mock.js";
import { mock as mockSymbol } from "./symbols.js";

await suite("mock", async () => {
    class TestClass {
        testProperty = "value";
        testMethod() {}
    }

    await test("should pass instanceof checks", async (t: TestContext) => {
        t.plan(1);
        const mockedInstance = mock(TestClass);

        // noinspection SuspiciousTypeOfGuard
        t.assert.ok(mockedInstance instanceof TestClass);
    });

    await test("should throw on property reads if not stubbed yet", async (t: TestContext) => {
        t.plan(1);
        const mockedInstance = mock(TestClass);

        t.assert.throws(() => {
            void (mockedInstance.testProperty);
        });
    });

    await test("should throw on property writes if not stubbed yet", async (t: TestContext) => {
        t.plan(1);
        const mockedInstance = mock(TestClass);

        t.assert.throws(() => {
            mockedInstance.testProperty = "newValue";
        });
    });

    await test("should throw on method calls if not stubbed yet", async (t: TestContext) => {
        t.plan(1);
        const mockedInstance = mock(TestClass);

        t.assert.throws(() => {
            mockedInstance.testMethod();
        });
    });

    await test("should contain stub information", async (t: TestContext) => {
        t.plan(1);
        const mockedInstance = mock(TestClass);

        t.assert.deepStrictEqual(mockedInstance[mockSymbol], { stubs: {}, type: "mock" });
    });

    await test("should throw if unknown property is accessed", async (t: TestContext) => {
        t.plan(1);
        const mockedInstance = mock(TestClass);

        t.assert.throws(() => {
            void (mockedInstance["foo" as keyof TestClass]);
        });
    });
});
