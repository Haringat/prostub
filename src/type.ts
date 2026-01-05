export interface Type<T extends object> {
    prototype: T;
    new(...args: Array<never>): T;
}
