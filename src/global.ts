// Extend the global Object interface to provide better type safety for hasOwnProperty
interface Object {
    hasOwnProperty<P extends PropertyKey>(property: P): this is { [K in P]: unknown };
}
