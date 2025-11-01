export interface Type<T extends object> {
    new (...args: never[]): T;
    prototype: T;
}
