import { suite, test, type TestContext } from "node:test";
import { answer, mock, returnFixed, spy, stub, verify } from "./index.js";

await suite("integration", async () => {
    await suite("mock", async () => {
        await test("verification across multiple invocations", (t: TestContext) => {
            t.plan(1);

            // Given
            class TestClass {
                method(_x: number) {
                    return 0;
                }
            }

            const mockInstance = mock(TestClass);
            stub(mockInstance).method.override(answer(x => x * 2));

            // When
            mockInstance.method(5);
            mockInstance.method(10);
            mockInstance.method(15);

            // Then
            t.assert.doesNotThrow(() => {
                verify(mockInstance).method.wasCalledTimes(3);
                verify(mockInstance).method.firstInvocation().returned(it => it === 10);
                verify(mockInstance).method.nthInvocation(1).returned(it => it === 20);
                verify(mockInstance).method.lastInvocation().returned(it => it === 30);
            });
        });
    });

    await suite("spy", async () => {
        await test("spy can call through real methods and stubs", (t: TestContext) => {
            t.plan(3);

            // Given
            class RealClass {
                multiply(x: number) {
                    return x * 2;
                }

                double() {
                    return 0;
                }
            }

            const realInstance = new RealClass();
            const spied = spy(realInstance);
            stub(spied).multiply.passThrough();
            stub(spied).double.override(returnFixed(100));

            // When
            const multiplyResult = spied.multiply(5);
            const doubleResult = spied.double();

            // Then
            t.assert.strictEqual(multiplyResult, 10);
            t.assert.strictEqual(doubleResult, 100);
            t.assert.doesNotThrow(() => {
                verify(spied).multiply.wasCalled();
                verify(spied).multiply.firstInvocation().returned(it => it === 10);
                verify(spied).double.wasCalled();
                verify(spied).double.firstInvocation().returned(it => it === 100);
            });
        });

        await test("stub can override conditionally", (t: TestContext) => {
            // Given
            class TestClass {
                method(_x: number) {
                    return 0;
                }
            }
            const mockInstance = spy(new TestClass());

            stub(mockInstance).method.on((it: number) => it > 10).override(returnFixed(100))
                .on(it => it === 5).passThrough()
                .on(() => true).override(returnFixed(2));

            // When
            const result1 = mockInstance.method(11);
            const result2 = mockInstance.method(5);
            const result3 = mockInstance.method(8);

            // Then
            t.assert.strictEqual(result1, 100);
            t.assert.strictEqual(result2, 0);
            t.assert.strictEqual(result3, 2);
        });
    });
});
