# ProStub

## Description

A mocking/stubbing library for JavaScript, inspired by Mockito. It is evironment-agnostic. The production code at run-time only relies on the JavaScript standard library and tslib. The test code relies on Node.js for running the tests, but the library itself can be used in any JavaScript environment (Node.js, browsers, Deno, etc.).

## Features

- Create mock and spy objects for classes and interfaces
- Stub methods and properties with various behaviors
- Verify interactions with mock objects
- Type-safe API with TypeScript support
- Lightweight and easy to use
- Low bundle size (~2.4KB minified + gzipped)
- Small API surface (only 15 API symbols)

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

The `stub()` function allows you to define custom behavior for methods and properties on mock objects. You can specify return values, thrown errors, or custom implementations for methods, as well as get/set behavior for properties.

A stub always follows the logic `stub(<mock>).<method/property> = <behavior>`, for example:

```typescript
import { fixedValue, mock, noop, stub } from "prostub";

class Example {
    method(): number {
        this.property = "changed";
    }
    property: string = "initial";
}

const mockedExample = mock(Example);

// Stubbing a method to return a fixed value
stub(mockedExample).method = noop();
stub(mockedExample).property = fixedValue("stubbed value");

// mockedExample.method() now no longer changes the property
// instead, it does nothing and returns undefined
// mockedExample.property now returns "stubbed value"
```

Note: The `stub()` function only works with mock and spy objects created by `mock()` and `spy()`. Attempting to use it on real objects will result in a runtime error.

Note 2: stubbed behavior only affects interactions with the mock/spy object itself. This is especially important for spies, as calls to methods on the real object from within other methods will not be affected by stubbing.

#### Function behaviors

- `answer(fn: (this: OriginalObjectType, ...args: OriginalFunctionArgs) => ReturnType)`: Defines a custom implementation for a method.
- `callThrough()`: Calls the original method implementation on a spy. Throws an error if used on a pure mock.
- `delegateTo(fn: (this: OriginalObjectType, ...args: OriginalFunctionArgs) => ReturnType)`: Delegates the method call to the provided function.
- `noop()`: A no-operation function that does nothing and returns `undefined`.
- `returnFixed(value: any)`: Returns a fixed value when the method is called.
- `returnSerial(...values: any[])`: Returns a series of values on successive calls.
- `throwOnCall(errorFactory: () => Error)`: Throws the specified error when the method is called.
- `when(condition: (args: OriginalFunctionArgs) => boolean)`: Specifies a condition for when the stubbed behavior should apply.

#### Property behaviors

- `fixedValue(value: any)`: Always returns the specified fixed value when the property is accessed.
- `defaultValue(value: any)`: Returns the specified default value when the property is accessed, but allows it to be changed.
- `trackValue()`: Tracks the value of the property, allowing it to be read and written like a normal property.

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

stub(mockedExample).method = returnFixed("stubbed result");

mockedExample.method(); // Returns "stubbed result"

verify(mockedExample).method.firstInvocation().returned(it =>
    it === "stubbed result"
); // Passes
verify(mockedExample).property.wasNotRead(); // Passes
```

## Building

The library is automatically built when running `pnpm install`, but it can be re-built manually by running `npm run prepare`.

## Testing

The library is fully tested using Node.js. Tests are executed as part of the building process, run inside the prepare hook, so when install the dependencies:

```bash
pnpm install
```

The tests will be run automatically. To run the tests manually, simply run:

```bash
npm test
```

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE.txt) file for details.
