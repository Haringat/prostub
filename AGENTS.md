# Agent Guidelines for Prostub

## Commands

- **Test**: `npm test` - Runs all `.spec.ts` files via rollup + Node
- **Build**: `node build.mjs` - Creates `/dist` with bundled output
- **Lint**: ESLint configured but no npm script; use your linter directly on `src/**/*.ts`

## Code Style

**Imports**: Sorted case-insensitive (dprint enforced); single-line per import/export; ES modules only
**Formatting**: dprint via `dprint.json` (120 char line width, 4 spaces, double quotes, never trailing commas, lf line endings)
**Types**: Strict mode enforced (noImplicitAny, noNonNullAssertion, etc.); use `Array<T>` generic syntax; no `any` types
**Naming**: camelCase or UPPER_CASE for variables; no leading/trailing underscores; kebab-case for file names (enforced by unicorn)
**Error handling**: Throw errors don't use null/undefined; declare all function returns explicitly
**Exports**: Use ESNext modules (type: "module" in package.json)

## Key Rules

- Strict TypeScript: `strict: true`, `noUnusedLocals`, `noUnusedParameters`
- No console.log except specific allowed methods (log, warn, error, etc.)
- No bitwise operators; no shadowing; no extraneous classes
- Member ordering enforced; adjacent overload signatures enforced
- No unsafe function types or wrapper object types
- When creating a code review, always check the results under .agents/CODE_REVIEW.md and see if they are outdated. When the code review is done, update that file with your findings.
