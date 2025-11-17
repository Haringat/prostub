import { test } from "node:test";
import assert from "node:assert";
import { mock, stub, defaultValue, fixedValue, trackValue } from "../index.js";

test("fixedValue() always returns the fixed value", () => {
    class TestClass {
        prop = "original";
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).prop = fixedValue("fixed");
    
    assert.strictEqual(mockInstance.prop, "fixed");
    assert.strictEqual(mockInstance.prop, "fixed");
});

test("fixedValue() throws when trying to set the property", () => {
    class TestClass {
        prop = "original";
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).prop = fixedValue("fixed");
    
    assert.throws(() => {
        mockInstance.prop = "new value";
    }, { message: /Cannot set value of a fixedValue property stub/ });
});

test("defaultValue() starts with default value", () => {
    class TestClass {
        prop = "original";
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).prop = defaultValue("default");
    
    assert.strictEqual(mockInstance.prop, "default");
});

test("defaultValue() allows setting and getting new values", () => {
    class TestClass {
        prop = "original";
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).prop = defaultValue("default");
    
    mockInstance.prop = "new value";
    assert.strictEqual(mockInstance.prop, "new value");
    
    mockInstance.prop = "another value";
    assert.strictEqual(mockInstance.prop, "another value");
});

test("trackValue() can be used as a stub", () => {
    // trackValue is designed to work with spy on real objects
    const stub_ = trackValue();
    assert(stub_ !== undefined);
});
