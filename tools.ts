export const cloneDeep = <T extends object>(obj: T) =>
  JSON.parse(JSON.stringify(obj)) as T;

const compareDeep = (obj1: object, obj2: object) =>
  JSON.stringify(obj1) === JSON.stringify(obj2);

const isFunction = <F extends Function>(value: unknown | F): value is F =>
  typeof value === "function";

export const arrayConstructor = <T>(
  length: number,
  constructor: ((index: number) => T) | T
): T[] =>
  Array.from({ length }, (_v, k) =>
    isFunction(constructor) ? constructor(k) : constructor
  );

export const isInLimit = (min: number, value: number, max: number) =>
  min <= value && value <= max;

const memo = <T, U extends Array<unknown>>(create: (...args: U) => T) => {
  let prevArgs: U | null = null;
  let prevResult: T;

  return (...args: U) => {
    if (prevArgs !== null) {
      if (compareDeep(args, prevArgs)) {
        return prevResult;
      }
    }

    const result = create(...args);
    prevArgs = cloneDeep(args);
    prevResult = result;
    return result;
  };
};
