import { AxisValue, Position } from "./position/position";
import { Color, Piece, Type } from "./pieces";
import readline from "node:readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const input = (text: any) => {
  return new Promise<string>((resolve) => {
    rl.question(String(text), (input) => {
      resolve(input);
    });
  });
};

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

export const isInLimit = (min: number, value: number, max: number) =>
  min <= value && value <= max;

const pieceSymbol = (piece: Piece) => {
  switch (piece.type) {
    case Type.King:
      return piece.color === Color.White ? "\u2654" : "\u265A";
    case Type.Queen:
      return piece.color === Color.White ? "\u2655" : "\u265B";
    case Type.Rock:
      return piece.color === Color.White ? "\u2656" : "\u265C";
    case Type.Bishop:
      return piece.color === Color.White ? "\u2657" : "\u265D";
    case Type.Knight:
      return piece.color === Color.White ? "\u2658" : "\u265E";
    case Type.Pawn:
      return piece.color === Color.White ? "\u2659" : "\u265F";
  }
};

export const printBoard = (pieces: Piece[]) => {
  for (let i = 7; i >= 0; i--) {
    let line = `${i + 1} |`;

    for (let j = 0; j <= 7; j++) {
      const piece = pieces.find((piece) => {
        return piece.isAt(
          new Position({ x: j as AxisValue, y: i as AxisValue })
        );
      });

      const symbol = piece && pieceSymbol(piece);

      line = line.concat((piece && symbol) ?? " ").concat("|");
    }

    console.log(line);
  }

  console.log("   A B C D E F G H");
};
