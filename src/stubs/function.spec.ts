import { test } from "node:test";
import assert from "node:assert";
import { mock, spy, stub, returnFixed, returnSerial, throwOnCall, callThrough, answer, delegateTo, noop, when } from "../index.js";

test("returnFixed() always returns the fixed value", () => {
    class TestClass {
        getValue() { return 0; }
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).getValue = returnFixed(42);
    
    assert.strictEqual(mockInstance.getValue(), 42);
    assert.strictEqual(mockInstance.getValue(), 42);
    assert.strictEqual(mockInstance.getValue(), 42);
});

test("returnFixed() works with different return types", () => {
    class TestClass {
        getString() { return ""; }
        getObject() { return { x: 0 }; }
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).getString = returnFixed("fixed string");
    stub(mockInstance).getObject = returnFixed({ x: 42 });
    
    assert.strictEqual(mockInstance.getString(), "fixed string");
    assert.strictEqual(mockInstance.getObject().x, 42);
});

test("returnSerial() returns values in sequence", () => {
    class TestClass {
        getValue() { return 0; }
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).getValue = returnSerial(1, 2, 3);
    
    assert.strictEqual(mockInstance.getValue(), 1);
    assert.strictEqual(mockInstance.getValue(), 2);
    assert.strictEqual(mockInstance.getValue(), 3);
});

test("returnSerial() throws when exhausted", () => {
    class TestClass {
        getValue() { return 0; }
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).getValue = returnSerial(1, 2);
    
    mockInstance.getValue();
    mockInstance.getValue();
    assert.throws(() => mockInstance.getValue(), { message: /No more return values left/ });
});

test("throwOnCall() throws an error on invocation", () => {
    class TestClass {
        method() {}
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = throwOnCall(() => new Error("method was called"));
    
    assert.throws(() => mockInstance.method(), { message: /method was called/ });
});

test("throwOnCall() can throw custom errors", () => {
    class TestClass {
        method() {}
    }
    
    const mockInstance = mock(TestClass);
    const customError = new Error("Custom error message");
    stub(mockInstance).method = throwOnCall(() => customError);
    
    assert.throws(() => mockInstance.method(), { message: /Custom error message/ });
});

test("callThrough() invokes the real method on the object", () => {
    class TestClass {
        method(x: number) {
            return x * 2;
        }
    }
    
    const realInstance = new TestClass();
    const spied = spy(realInstance);
    stub(spied).method = callThrough();
    
    assert.strictEqual(spied.method(5), 10);
    assert.strictEqual(spied.method(3), 6);
});

test("callThrough() works with methods that throw", () => {
    class TestClass {
        method() {
            throw new Error("original error");
        }
    }
    
    const realInstance = new TestClass();
    const spied = spy(realInstance);
    stub(spied).method = callThrough();
    
    assert.throws(() => spied.method(), { message: /original error/ });
});

test("answer() invokes a function with call arguments", () => {
    class TestClass {
        compute(_x: number, _y: number) { return 0; }
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).compute = answer((x: number, y: number) => x + y);
    
    assert.strictEqual((mockInstance.compute as any)(5, 3), 8);
    assert.strictEqual((mockInstance.compute as any)(10, 20), 30);
});

test("answer() handles thrown errors", () => {
    class TestClass {
        method() {}
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = answer(() => {
        throw new Error("answer threw");
    });
    
    assert.throws(() => mockInstance.method(), { message: /answer threw/ });
});

test("delegateTo() delegates to another function", () => {
    class TestClass {
        method(_x: number) { return 0; }
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = delegateTo((x: number) => x * 3);
    
    assert.strictEqual(mockInstance.method(5), 15);
    assert.strictEqual(mockInstance.method(2), 6);
});

test("noop() returns undefined", () => {
    class TestClass {
        method() {}
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = noop();
    
    assert.strictEqual(mockInstance.method(), undefined);
});

test("when() matches arguments and returns appropriate stub", () => {
    class TestClass {
        getValue(n: number) { return 0; }
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).getValue = when<TestClass, "getValue", [number], number>(
        (n: number) => n > 10
    ).then(returnFixed(100))
     .when((n: number) => n <= 10)
     .then(returnFixed(50));
    
    assert.strictEqual(mockInstance.getValue(15), 100);
    assert.strictEqual(mockInstance.getValue(5), 50);
});

test("when() throws when no matching predicate", () => {
    class TestClass {
        getValue(n: number) { return 0; }
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).getValue = when<TestClass, "getValue", [number], number>(
        (n: number) => n > 10
    ).then(returnFixed(100));
    
    assert.throws(() => mockInstance.getValue(5), { message: /No matching stub found/ });
});

test("when() with multiple conditions", () => {
    class TestClass {
        getValue(n: number) { return 0; }
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).getValue = when<TestClass, "getValue", [number], number>(
        (n: number) => n > 20
    ).then(returnFixed(200))
     .when((n: number) => n > 10)
     .then(returnFixed(100))
     .when((n: number) => n > 0)
     .then(returnFixed(50));
    
    assert.strictEqual(mockInstance.getValue(25), 200);
    assert.strictEqual(mockInstance.getValue(15), 100);
    assert.strictEqual(mockInstance.getValue(5), 50);
});
