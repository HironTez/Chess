import readline from "node:readline";
import { Color, Piece, Position, Type } from "../src";

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
const pieceSymbol = (piece: Piece) => {
  switch (piece.type) {
    case Type.King:
      return piece.color === Color.White ? "\u2654" : "\u265A";
    case Type.Queen:
      return piece.color === Color.White ? "\u2655" : "\u265B";
    case Type.Rook:
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
        return piece.isAt(new Position({ x: j, y: i }));
      });

      const symbol = piece && pieceSymbol(piece);

      line = line.concat((piece && symbol) ?? " ").concat("|");
    }

    console.log(line);
  }

  console.log("   A B C D E F G H");
};

export const parseMoveInput = (moveInput: string) => {
  const positions = moveInput.match(/^([a-hA-H][1-8]).*([a-hA-H][1-8])$/);
  const startPositionNotation = positions?.at(1);
  const endPositionNotation = positions?.at(2);
  const startPosition = startPositionNotation
    ? new Position(startPositionNotation)
    : undefined;
  const endPosition = endPositionNotation
    ? new Position(endPositionNotation)
    : undefined;

  return { startPosition, endPosition };
};
