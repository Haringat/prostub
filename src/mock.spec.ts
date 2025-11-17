import { test } from "node:test";
import assert from "node:assert";
import { mock, spy, stub, returnFixed, fixedValue, callThrough } from "./index.js";

test("mock() creates a mock instance with no stubs initially", () => {
    class TestClass {
        method() { return "original"; }
    }
    
    const mockInstance = mock(TestClass);
    assert.throws(() => mockInstance.method(), { message: /No stub defined/ });
});

test("mock() allows stubbing methods", () => {
    class TestClass {
        method() { return "original"; }
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = returnFixed("mocked");
    
    assert.strictEqual(mockInstance.method(), "mocked");
});

test("mock() allows stubbing properties", () => {
    class TestClass {
        prop = "original";
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).prop = fixedValue("mocked");
    
    assert.strictEqual(mockInstance.prop, "mocked");
});

test("spy() wraps a real object and tracks calls", () => {
    class TestClass {
        method() { return "real"; }
    }
    
    const realInstance = new TestClass();
    const spied = spy(realInstance);
    stub(spied).method = callThrough();
    
    assert.strictEqual(spied.method(), "real");
});

test("spy() prevents access to unstubbed members", () => {
    class TestClass {
        method() { return "real"; }
    }
    
    const realInstance = new TestClass();
    const spied = spy(realInstance);
    
    assert.throws(() => spied.method(), { message: /No stub defined/ });
});

test("stub() throws when assigning non-stub values", () => {
    class TestClass {
        method() { return "original"; }
    }
    
    const mockInstance = mock(TestClass);
    assert.throws(() => {
        (stub(mockInstance) as any).method = "not a stub";
    }, { message: /must be a stub/ });
});

test("stub() throws when defining stub twice for same property", () => {
    class TestClass {
        method() { return "original"; }
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = returnFixed("first");
    assert.throws(() => {
        stub(mockInstance).method = returnFixed("second");
    }, { message: /already defined/ });
});

test("stub() throws when trying to read a stub (stubs can only be set)", () => {
    class TestClass {
        method() { return "original"; }
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = returnFixed("value");
    
    assert.throws(() => {
        (stub(mockInstance) as any).method;
    }, { message: /Cannot get stub/ });
});
