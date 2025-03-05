import readline from "node:readline";
import { Color, Piece, Position, Type } from "../src";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const input = (text: string) => {
  return new Promise<string>((resolve) => {
    rl.question(text, (input) => {
      resolve(input);
    });
  });
};

const getPieceCharacter = (piece: Piece) => {
  const isWhite = piece.color === Color.White;
  switch (piece.type) {
    case Type.King:
      return isWhite ? "\u2654" : "\u265A";
    case Type.Queen:
      return isWhite ? "\u2655" : "\u265B";
    case Type.Rook:
      return isWhite ? "\u2656" : "\u265C";
    case Type.Bishop:
      return isWhite ? "\u2657" : "\u265D";
    case Type.Knight:
      return isWhite ? "\u2658" : "\u265E";
    case Type.Pawn:
      return isWhite ? "\u2659" : "\u265F";
  }
};

export const stringifyBoard = (pieces: Piece[]) => {
  let boardString = "";

  for (let i = 7; i >= 0; i--) {
    boardString = boardString.concat(`${i + 1} |`);

    for (let j = 0; j <= 7; j++) {
      const piece = pieces.find((piece) => {
        return piece.isAt(new Position({ x: j, y: i }));
      });

      const character = piece && getPieceCharacter(piece);

      boardString = boardString.concat((piece && character) ?? " ").concat("|");
    }

    boardString = boardString.concat("\n");
  }

  boardString = boardString.concat("   A B C D E F G H");
  return boardString;
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

export const capitalize = (s: string) => {
  return s[0].toUpperCase() + s.slice(1);
};
