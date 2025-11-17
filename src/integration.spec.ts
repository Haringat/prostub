import { test } from "node:test";
import assert from "node:assert";
import { mock, spy, stub, verify, answer, callThrough, returnFixed } from "./index.js";

test("verification works across multiple invocations", () => {
    class TestClass {
        method(_x: number) { return 0; }
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = answer((x: number) => x * 2);
    
    mockInstance.method(5);
    mockInstance.method(10);
    mockInstance.method(15);
    
    verify(mockInstance).method.wasCalledTimes(3);
    verify(mockInstance).method.nthInvocation(0).returned((it: any) => it === 10);
    verify(mockInstance).method.nthInvocation(1).returned((it: any) => it === 20);
    verify(mockInstance).method.nthInvocation(2).returned((it: any) => it === 30);
});

test("spy can call through real methods and stubs", () => {
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
    stub(spied).multiply = callThrough();
    stub(spied).double = returnFixed(100);
    
    assert.strictEqual(spied.multiply(5), 10);
    assert.strictEqual(spied.double(), 100);
    
    verify(spied).multiply.wasCalledTimes(1);
    verify(spied).double.wasCalledTimes(1);
});
