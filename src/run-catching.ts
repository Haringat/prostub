/**
 * Executes a function and captures any thrown errors.
 * @param fn The function to execute.
 * @param thisArg The value to use as `this` when executing the function.
 * @param args The arguments to pass to the function.
 * @returns An object indicating whether the function executed successfully or threw an error.
 * @example
 * ```ts
 * const result = runCatching(function (this: {foo: number}, a: number, b: number) {
 *     return this.foo + a + b;
 * }, {foo: 5}, 10, 0);
 * console.log(result); // { result: "success", returnValue: 5 }
 * ```
 */
export function runCatching<TThis, TArgs extends Array<unknown>, TReturn>(
    fn: (this: TThis, ...args: TArgs) => TReturn,
    thisArg: TThis,
    ...args: TArgs
): { result: "success"; returnValue: TReturn; } | { result: "error"; error: unknown; } {
    try {
        const result = fn.apply(thisArg, args);
        return { result: "success", returnValue: result };
    } catch (error) {
        return { result: "error", error };
    }
}
