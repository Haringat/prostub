# ProStub

## Description

A mocking/stubbing library for JavaScript, inspired by Mockito. It is evironment-agnostic. The production code at run-time only relies on the JavaScript standard library. The test code relies on Node.js for running the tests, but the library itself can be used in any JavaScript environment (Node.js, browsers, Deno, etc.).

## Features

- Create mock and spy objects for classes and interfaces
- Stub methods and properties with various behaviors
- Verify interactions with mock objects
- Type-safe API with TypeScript support
- Lightweight and easy to use
- No external dependencies
- Low bundle size (~2.8KB minified + gzipped)
- Small API surface (only 11 public API symbols)

It consists of 3 separate DSLs:

### The Mocking DSL

The `mock()` and `spy()` functions create mock objects that can be used in place of real objects during testing. Mocks record interactions and can be verified later. By default, all interactions throw errors unless stubbed.

They are created as follows:

```typescript
import { mock, spy } from "prostub";

class Example {
}

const mockedExample = mock(Example);

const realExample = new Example();
const spiedExample = spy(realExample);
```

### The Stubbing DSL

The `stub()` function allows you to define custom behavior for methods and
properties on mock objects. You can specify return values, thrown errors, or
custom implementations for methods, as well as get/set behavior for properties.

There are three methods for stubbing:
- **override**: Overrides the behavior of a method or property on a mock object.
- **on**: Specifies different behaviors for a method depending on the arguments
  passed to it (only available for methods).
- **passThrough**: Specifies that a method should be called on the real object
  (only if the mock object is a spy).

Note: The `stub()` function only works with mock and spy objects created by
`mock()` and `spy()`. Attempting to use it on real objects will result in a
runtime error.

Note 2: stubbed behavior only affects interactions with the mock/spy object
itself. This is especially important for spies, as stubbing will not affect
calls to methods on the real object from within other methods.

#### Overriding existing behavior

This is useful when you want to unconditionally replace the behavior of a
method or property on a mock or spy.

```typescript
import { fixedValue, mock, noop, stub } from "prostub";

declare class Example {
    method(): number;
    property: string;
}

const mockedExample = mock(Example);

// Stubbing a method to return a fixed value
stub(mockedExample).method.override(noop());
stub(mockedExample).property.override(fixedValue("stubbed value"));


console.log(mockedExample.method()); // prints undefined
console.log(mockedExample.property); // prints "stubbed value"
```

#### Conditional behavior

This is useful when you want a method stub to behave differently based on
certain conditions. For example, you might want a method to return a different
value depending on the arguments passed to it. For each case you have the
choice whether you want to override the behavior or (on spies) pass it through
to the original implementation.

`.on(...)` chains are evaluated in the order they are defined. The first
matching condition will be used to determine the behavior of the method.

```typescript
declare class Example {
    method(arg1: string, arg2: string): string;
}

const mockedExample = mock(Example);

stub(mockedExample).method.on(arg1 => arg1 === "foo", arg2 => arg2 === "bar").override(returnFixed("stubbed value"))
    .on(() => true, () => true).override(returnFixed("another stubbed value"));

console.log(mockedExample.method("foo", "bar")); // "stubbed value"
console.log(mockedExample.method("boo", "baz")); // "another stubbed value"
```

#### Using original implementations

For spies, using the default implementation of a class is **not** implied but
must explicitly be enabled using `callThrough()`.

```typescript
class Example {
    method(arg1: string, arg2: string): string {
        return arg1 + arg2;
    }
}

const mockedExample = spy(new Example());

stub(mockedExample).method.callThrough();

console.log(mockedExample.method("foo", "bar")); // "foobar"

```

#### Stub Behaviors

- `answer(fn: (this: OriginalObjectType, ...args: OriginalFunctionArgs) => ReturnType)`: Defines a custom implementation for a method.
- `noop()`: A no-operation function that does nothing and returns `undefined`.
- `returnFixed(value: any)`: Returns a fixed value when the method is called.
- `returnSerial(...values: any[])`: Returns a series of values on successive calls.
- `throwOnCall(errorFactory: () => Error)`: Throws the specified error when the method is called.
- `fixedValue(value: any)`: Always returns the specified fixed value when the property is accessed.
- `defaultValue(value: any)`: Returns the specified default value when the property is accessed but allows it to be changed.

### The Verification DSL

The `verify()` function allows you to assert that certain interactions occurred on mock objects. You can verify method calls, property accesses, and the number of times they were called.

For example:

```typescript
import { mock, returnFixed, verify } from "prostub";
class Example {
    method(): string {
        return this.property;
    }
    property: string = "initial";
}

const mockedExample = mock(Example);

stub(mockedExample).method.override(returnFixed("stubbed result"));

mockedExample.method(); // Returns "stubbed result"

verify(mockedExample).method.firstInvocation().returned(it =>
    it === "stubbed result"
); // Passes
verify(mockedExample).property.wasNotRead(); // Passes
```

When verifying calls to methods with overrides, one must specify explicitly which overload to verify. For example:

```typescript
import {mock, returnFixed, when, verify} from "prostub";

declare class SomeClass {
    method(a: number): string;
    method(a: string): number
}

const mockedExample = mock(SomeClass);

stub(mockedExample).method.pi.on(it => typeof it === "number").override(returnFixed("stubbed result"))
    .on(it => typeof it === "string").override(returnFixed(100));

mockedExample.method(1);
mockedExample.method("foo");

verify(mockedExample).pickOverload<[number], string>().nthInvocation(0).returned(it =>
    it === "stubbed result"
); // Passes
verify(mockedExample).pickOverload<[number], string>().nthInvocation(0).hadArguments(it =>
    it === 1
); // Passes
verify(mockedExample).pickOverload<[string], number>().nthInvocation(1).returned(it =>
    it === 100
); // Passes
verify(mockedExample).pickOverload<[string], number>().nthInvocation(1).hadArguments(it =>
    it === "foo"
); // Passes
```

**Note**: The invocation count is tallied over all overloads, so even though we selected one specific overload, the invocation count is still incremented for all overloads. This is a known limitation of the design.

## Building

The library is automatically built when running `pnpm install`, but it can be re-built manually by running `npm run prepare`.

## Testing

The library is fully tested using Node.js. Tests are executed as part of the building process, run inside the prepare hook, so when install the dependencies:

```bash
pnpm install
```

The tests will be run automatically. To run the tests manually, run:

```bash
npm test
```

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE.txt) file for details.
