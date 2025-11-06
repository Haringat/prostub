import {Mock, answer, callThrough, fixedValue, mock, stub, spy, verify, returnFixed, returnSerial, throwOnCall, when} from "./dist/index";

class Foo {
    x: string = "original x";

    bar(): string {
        return "original bar";
    }
}

class Bar {
    baz(): number {
        return 42;
    }

    boo() {
        return "original boo";
    }

    boom() {
        throw new Error("original boom");
    }

    moo() {
        return "original moo";
    }
}

class Baz {
    double(n: number): number {
        return n * 2;
    }
    triple(n: number): number {
        return n * 3;
    }
}

const fooMock: Mock<Foo> = mock(Foo);
const barMock: Mock<Bar> = spy(new Bar());
const bazMock: Mock<Baz> = spy(new Baz());

stub(fooMock).bar = returnFixed("mocked bar");
stub(barMock).baz = callThrough();
stub(fooMock).x = fixedValue("mocked x");
stub(barMock).boo = throwOnCall(() => new Error("boo was called"));
stub(barMock).boom = callThrough();
stub(barMock).moo = returnSerial("first", "second", "third");
stub(bazMock).double = when<Baz, "double", [number], number>(n => n > 10)
    .then(returnFixed(100))
    .when(n => n <= 10)
    .then(callThrough());
stub(bazMock).triple = answer(n => n * 4); // Not used in this test

console.log(fooMock.bar()); // Output: "mocked bar"
console.log(fooMock.x);    // Output: "mocked x"
console.log(barMock.baz()); // Output: 42
try {
    barMock.boo(); // Throws Error: "boo was called"
} catch (e) {
}
try {
    barMock.boom(); // Throws Error: "original boom"
} catch (e) {
}
console.log(barMock.moo()); // Output: "first"
console.log(barMock.moo()); // Output: "second"
console.log(barMock.moo()); // Output: "third"
try {
    barMock.moo(); // Throws Error: No more return values left in returnSerial stub
} catch (e) {
}
console.log(bazMock.double(5));  // Output: 10 (call through)
console.log(bazMock.double(15)); // Output: 100 (mocked)

verify(fooMock).bar.wasCalled();
verify(fooMock).bar.firstInvocation().returned(it => it === "mocked bar");
verify(barMock).baz.wasCalled();
verify(barMock).baz.firstInvocation().returned(it => it === 42);
verify(fooMock).x.wasRead();
verify(fooMock).x.firstRead().hadValue(it => it === "mocked x");
verify(barMock).boo.wasCalled();
verify(barMock).boo.firstInvocation().threw(it => it instanceof Error && it.message === "boo was called");
verify(barMock).boom.wasCalled();
verify(barMock).boom.firstInvocation().threw(it => it instanceof Error && it.message === "original boom");
verify(barMock).moo.wasCalledTimes(4);
verify(barMock).moo.nthInvocation(0).returned(it => it === "first");
verify(barMock).moo.nthInvocation(1).returned(it => it === "second");
verify(barMock).moo.nthInvocation(2).returned(it => it === "third");
verify(barMock).moo.nthInvocation(3).threw(it => it instanceof Error && it.message.includes("No more return values left in returnSerial stub"));
verify(bazMock).double.wasCalledTimes(2);
verify(bazMock).double.invocationMatching((it) => it === 5).returned(it => it === 10);
verify(bazMock).double.invocationMatching((it) => it === 15).returned(it => it === 100);
