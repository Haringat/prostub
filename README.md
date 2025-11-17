# ProStub

## Description

A mocking/stubbing library for JavaScript, inspired by Mockito. It is evironment-agnostic, `@types/node` is included as a dev-dependency to provide `console` during testing. The production code at run-time only relies on the JavaScript standard library

## Building

The library is automatically built when running `pnpm install`, but it can be re-built manually by running `npm run prepare`.

## Testing

The library includes a comprehensive test suite with 49 unit tests covering all major features and APIs. Tests are organized in spec files co-located with their source code:

- `src/mock.spec.ts` - Core mock(), spy(), and stub() functionality
- `src/stubs/function.spec.ts` - Function stub implementations
- `src/stubs/property.spec.ts` - Property stub implementations
- `src/verify.spec.ts` - Verification API
- `src/integration.spec.ts` - Integration tests

Run the tests using Node's built-in test runner:

```bash
npm test
```

All tests pass and are tracked in TAP v13 format.

