# ProStub

## Description

A mocking/stubbing library for JavaScript, inspired by Mockito. It is evironment-agnostic, `@types/node` is included as a dev-dependency to provide `console` during testing. The production code at run-time only relies on the JavaScript standard library

## Building

The library is automatically built when running `pnpm install`, but it can be re-built manually by running `npm run prepare`.

## Testing

Right now there are no unit tests. However, there is a `test.ts`, which examplifies how the library is meant to be used. It can be executed by running `npm test`.

