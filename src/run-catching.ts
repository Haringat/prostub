type ThisArg<T> = T extends (this: infer TThis, ...args: any[]) => any ? TThis : unknown;

export function runCatching<T extends (this: any, ...args: any[]) => any>(fn: T, thisArg: ThisArg<T>, ...args: Parameters<T>): { result: "success", returnValue: ReturnType<T>} |  { result: "error", error: unknown } {
    try {
        const result = fn.apply(thisArg, args);
        return { result: "success", returnValue: result };
    } catch (error) {
        return { result: "error", error };
    }
}
