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
        (stub(mockInstance) as unknown as { method: { override(a: unknown): void }; }).method.override("not a stub");
    }, { message: /Behavior for property ".+" is not a stub./ });
});

test("stub() throws when defining stub twice for same property", () => {
    class TestClass {
        method() {
            return "original";
        }
    }

    const mockInstance = mock(TestClass);
    stub(mockInstance).method.override(returnFixed("first"));
    assert.throws(() => {
        stub(mockInstance).method.override(returnFixed("second"));
    }, { message: /already defined/ });
});