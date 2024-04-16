import { expect, test } from "bun:test";
import { Board } from "../board";
import { Color, King, Knight, Pawn } from "../pieces";
import { Position } from "../position/position";

test("knight possible positions", () => {
  const board = new Board([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Knight("C4", Color.White),
    new Pawn("E3", Color.Black),
  ]);

  const expectedPositions = [
    new Position("D6"),
    new Position("E5"),
    new Position("E3"),
    new Position("D2"),
    new Position("B2"),
    new Position("A3"),
    new Position("A5"),
    new Position("B6"),
  ];

  const knight = board.getPieceAt("C4")!;
  expect(knight).toBeDefined();
  const possibleMoves = knight.getPossibleMoves();
  expect(possibleMoves).not.toBeEmpty();

  for (const position of expectedPositions) {
    const matchedMove = possibleMoves.find(
      (possibleMove) => possibleMove.distanceTo(position) === 0,
    );

    expect(matchedMove).not.toBeUndefined();
  }
});
