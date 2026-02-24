// Extend the global Object interface to provide better type safety for hasOwnProperty
declare global {
    interface Object {
        hasOwnProperty<P extends PropertyKey>(property: P): this is { [K in P]: unknown; };
    }
}
