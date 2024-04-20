import { expect, test } from "bun:test";
import { Color, Pawn, Position } from "../src";

test("pawn possible positions", () => {
  const expectedPositions = [
    new Position("A3"),
    new Position("B3"),
    new Position("C3"),
  ];

  const pawn = new Pawn("B2", Color.White);
  const possibleMoves = pawn.getPossibleMoves();
  expect(possibleMoves).not.toBeEmpty();

  for (const position of expectedPositions) {
    const matchedMove = possibleMoves.find(
      (possibleMove) => possibleMove.distanceTo(position) === 0,
    );

    expect(matchedMove).not.toBeUndefined();
  }
});
