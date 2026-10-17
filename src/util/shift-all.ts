import type {Shift} from "./shift.js";

export type ShiftAll<T extends ReadonlyArray<ReadonlyArray<unknown>>> = {
    [K in keyof T]: T[K] extends ReadonlyArray<unknown> ? Shift<T[K]> : [];
};
