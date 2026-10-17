import type {ShiftAll} from "./shift-all.js";

type HeadUnion<T extends ReadonlyArray<ReadonlyArray<unknown>>> = T[number][0];

export type UnionZip<
    T extends ReadonlyArray<ReadonlyArray<unknown>>,
    Acc extends ReadonlyArray<unknown> = []
> = [T[number]] extends [readonly []]
    ? Acc
    : UnionZip<ShiftAll<T>, [...Acc, HeadUnion<T>]>;
