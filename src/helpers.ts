// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const isFunction = <F extends Function>(value: unknown | F): value is F =>
  typeof value === "function";

export const arrayConstructor = <T>(
  length: number,
  constructor: ((index: number) => T) | T,
): T[] =>
  Array.from({ length }, (_v, k) =>
    isFunction(constructor) ? constructor(k) : constructor,
  );

export const isInLimit = (min: number, value: number, max: number) =>
  min <= value && value <= max;
