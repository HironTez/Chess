export const cloneDeep = <T extends object>(obj: T) =>
  JSON.parse(JSON.stringify(obj)) as T;

const isFunction = <F extends Function>(value: unknown | F): value is F =>
  typeof value === "function";

export const arrayConstructor = <T>(
  length: number,
  constructor: ((index: number) => T) | T
): T[] =>
  Array.from({ length }, (_v, k) =>
    isFunction(constructor) ? constructor(k) : constructor
  );
