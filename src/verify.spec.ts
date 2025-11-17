import { test } from "node:test";
import assert from "node:assert";
import { mock, stub, verify, returnFixed, returnSerial, throwOnCall, answer, fixedValue, defaultValue } from "./index.js";

test("verify().method.wasCalled() passes when method was called", () => {
    class TestClass {
        method() {}
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = returnFixed(undefined);
    
    mockInstance.method();
    verify(mockInstance).method.wasCalled();
});

test("verify().method.wasNotCalled() passes when method was not called", () => {
    class TestClass {
        method() {}
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = returnFixed(undefined);
    
    verify(mockInstance).method.wasNotCalled();
});

test("verify().method.wasCalled() throws when method was not called", () => {
    class TestClass {
        method() {}
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = returnFixed(undefined);
    
    assert.throws(() => verify(mockInstance).method.wasCalled(), { message: /Expected function to be called 1 times, but was called 0 times/ });
});

test("verify().method.wasCalledTimes(n) verifies exact call count", () => {
    class TestClass {
        method() {}
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = returnFixed(undefined);
    
    mockInstance.method();
    mockInstance.method();
    mockInstance.method();
    
    verify(mockInstance).method.wasCalledTimes(3);
});

test("verify().method.wasCalledTimes() throws on mismatch", () => {
    class TestClass {
        method() {}
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = returnFixed(undefined);
    
    mockInstance.method();
    
    assert.throws(() => verify(mockInstance).method.wasCalledTimes(3), { message: /Expected function to be called 3 times, but was called 1 times/ });
});

test("verify().method.firstInvocation() gets first call", () => {
    class TestClass {
        method() { return 0; }
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = returnFixed(42);
    
    mockInstance.method();
    mockInstance.method();
    
    verify(mockInstance).method.firstInvocation().returned((it: any) => it === 42);
});

test("verify().method.nthInvocation(n) gets nth call", () => {
    class TestClass {
        method() { return 0; }
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = returnSerial(1, 2, 3);
    
    mockInstance.method();
    mockInstance.method();
    mockInstance.method();
    
    verify(mockInstance).method.nthInvocation(0).returned((it: any) => it === 1);
    verify(mockInstance).method.nthInvocation(1).returned((it: any) => it === 2);
    verify(mockInstance).method.nthInvocation(2).returned((it: any) => it === 3);
});

test("verify().method.nthInvocation() throws on invalid index", () => {
    class TestClass {
        method() {}
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = returnFixed(undefined);
    
    assert.throws(() => verify(mockInstance).method.nthInvocation(0), { message: /out of bounds/ });
});

test("verify().method.lastInvocation() gets last call", () => {
    class TestClass {
        method() { return 0; }
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = returnSerial(1, 2, 3);
    
    mockInstance.method();
    mockInstance.method();
    mockInstance.method();
    
    verify(mockInstance).method.lastInvocation().returned((it: any) => it === 3);
});

test("verify().method.invocationMatching(predicate) finds matching invocation", () => {
    class TestClass {
        method(x: number) { return 0; }
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = answer((x: number) => x * 2);
    
    mockInstance.method(5);
    mockInstance.method(10);
    mockInstance.method(15);
    
    verify(mockInstance).method.invocationMatching((it: any) => it === 10).returned((res: any) => res === 20);
});

test("verify().method.invocationMatching() throws when no match", () => {
    class TestClass {
        method(x: number) { return 0; }
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = answer((x: number) => x * 2);
    
    mockInstance.method(5);
    
    assert.throws(() => {
        verify(mockInstance).method.invocationMatching((it: any) => it === 10);
    }, { message: /No invocation found matching/ });
});

test("verify().method.firstInvocation().returned(predicate) verifies return value", () => {
    class TestClass {
        method() { return ""; }
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = returnFixed("test value");
    
    mockInstance.method();
    
    verify(mockInstance).method.firstInvocation().returned((it: any) => it === "test value");
});

test("verify().method.firstInvocation().returned() throws on predicate failure", () => {
    class TestClass {
        method() { return ""; }
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = returnFixed("actual value");
    
    mockInstance.method();
    
    assert.throws(() => {
        verify(mockInstance).method.firstInvocation().returned((it: any) => it === "expected value");
    }, { message: /did not satisfy/ });
});

test("verify().method.firstInvocation().threw() verifies exception", () => {
    class TestClass {
        method() {}
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = throwOnCall(() => new Error("test error"));
    
    try {
        mockInstance.method();
    } catch {
        // expected
    }
    
    verify(mockInstance).method.firstInvocation().threw((it: any) => it instanceof Error && it.message === "test error");
});

test("verify().method.firstInvocation().threw() throws when no exception", () => {
    class TestClass {
        method() {}
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).method = returnFixed(undefined);
    
    mockInstance.method();
    
    assert.throws(() => {
        verify(mockInstance).method.firstInvocation().threw((it: any) => true);
    }, { message: /Expected invocation to throw/ });
});

test("verify().prop.wasRead() verifies property was read", () => {
    class TestClass {
        prop = "value";
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).prop = fixedValue("mocked");
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const v = mockInstance.prop;
    
    verify(mockInstance).prop.wasRead();
});

test("verify().prop.hadValue() verifies property value on read", () => {
    class TestClass {
        prop = "value";
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).prop = fixedValue("test value");
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const v = mockInstance.prop;
    
    verify(mockInstance).prop.firstRead().hadValue((it: any) => it === "test value");
});

test("verify().prop.wasAssigned() verifies property was assigned", () => {
    class TestClass {
        prop = "value";
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).prop = defaultValue("initial");
    
    mockInstance.prop = "new value";
    
    verify(mockInstance).prop.wasAssigned();
});

test("verify().prop.firstAssignment().hasValue() verifies assigned value", () => {
    class TestClass {
        prop = "value";
    }
    
    const mockInstance = mock(TestClass);
    stub(mockInstance).prop = defaultValue("initial");
    
    mockInstance.prop = "new value";
    
    verify(mockInstance).prop.firstAssignment().hasValue((it: any) => it === "new value");
});
