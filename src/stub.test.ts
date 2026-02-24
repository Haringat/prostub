import assert from "node:assert";
import { test } from "node:test";
import { mock } from "./mock.js";
import { stub } from "./stub.js";
import { returnFixed } from "./stubs/function/return-fixed.js";

test("stub() throws when assigning non-stub values", () => {
    class TestClass {
        method() {
            return "original";
        }
    }

    const mockInstance = mock(TestClass);
    assert.throws(() => {
        (stub(mockInstance) as unknown as { method: unknown; }).method = "not a stub";
    }, { message: /must be a stub/ });
});

test("stub() throws when defining stub twice for same property", () => {
    class TestClass {
        method() {
            return "original";
        }
    }

    const mockInstance = mock(TestClass);
    stub(mockInstance).method = returnFixed("first");
    assert.throws(() => {
        stub(mockInstance).method = returnFixed("second");
    }, { message: /already defined/ });
});

test("stub() throws when trying to read a stub (stubs can only be set)", () => {
    class TestClass {
        method() {
            return "original";
        }
    }

    const mockInstance = mock(TestClass);
    stub(mockInstance).method = returnFixed("value");

    assert.throws(() => {
        void ((stub(mockInstance) as unknown as TestClass).method);
    }, { message: /Cannot get stub/ });
});
