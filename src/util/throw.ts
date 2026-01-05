/**
 * Throws the given error. Useful for expressions that require a value, but you want to throw an error instead.
 * @example
 * ```ts
 * const value: number = someValue ?? _throw(new Error("someValue is required"));
 * ```
 * @param e - The error to throw.
 * @throws The provided error.
 */
export function _throw(e: unknown): never {
    throw e;
}
