import type {AnyFunction} from "./any-function.js";

export type OverloadToUnion<F extends AnyFunction> = F extends {
    (...args: infer TArgs1): infer TReturn1;
    (...args: infer TArgs2): infer TReturn2;
    (...args: infer TArgs3): infer TReturn3;
    (...args: infer TArgs4): infer TReturn4;
    (...args: infer TArgs5): infer TReturn5;
    (...args: infer TArgs6): infer TReturn6;
    (...args: infer TArgs7): infer TReturn7;
    (...args: infer TArgs8): infer TReturn8;
    (...args: infer TArgs9): infer TReturn9;
    (...args: infer TArgs10): infer TReturn10;
    (...args: infer TArgs11): infer TReturn11;
    (...args: infer TArgs12): infer TReturn12;
    (...args: infer TArgs13): infer TReturn13;
    (...args: infer TArgs14): infer TReturn14;
    (...args: infer TArgs15): infer TReturn15;
    (...args: infer TArgs16): infer TReturn16;
} ? ((...args: TArgs1) => TReturn1) |
    ((...args: TArgs2) => TReturn2) |
    ((...args: TArgs3) => TReturn3) |
    ((...args: TArgs4) => TReturn4) |
    ((...args: TArgs5) => TReturn5) |
    ((...args: TArgs6) => TReturn6) |
    ((...args: TArgs7) => TReturn7) |
    ((...args: TArgs8) => TReturn8) |
    ((...args: TArgs9) => TReturn9) |
    ((...args: TArgs10) => TReturn10) |
    ((...args: TArgs11) => TReturn11) |
    ((...args: TArgs12) => TReturn12) |
    ((...args: TArgs13) => TReturn13) |
    ((...args: TArgs14) => TReturn14) |
    ((...args: TArgs15) => TReturn15) |
    ((...args: TArgs16) => TReturn16) :
    never;
