import { expect, test } from "bun:test";
import { CustomBoard } from "../src/board";
import { Color, King, Pawn } from "../src/pieces";
import { Position } from "../src/position";

test("pawn possible positions", () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Pawn("B2", Color.White),
    new Pawn("A3", Color.Black),
    new Pawn("C3", Color.Black),
  ]);

  const expectedPositions = [
    new Position("A3"),
    new Position("B3"),
    new Position("C3"),
  ];

  const pawn = board.getPieceAt("B2")!;
  expect(pawn).toBeDefined();
  const possibleMoves = pawn.getPossibleMoves();
  expect(possibleMoves).not.toBeEmpty();

  for (const position of expectedPositions) {
    const matchedMove = possibleMoves.find(
      (possibleMove) => possibleMove.distanceTo(position) === 0,
    );

    expect(matchedMove).not.toBeUndefined();
  }
});
