import { expect, test } from "bun:test";
import { Color, King, Position } from "../src";

test("king possible positions", () => {
  const expectedPositions = [
    new Position("E5"),
    new Position("F5"),
    new Position("F4"),
    new Position("F3"),
    new Position("E3"),
    new Position("D3"),
    new Position("D4"),
    new Position("D5"),
  ];

  const king = new King("E4", Color.White);
  const possibleMoves = king.getPossibleMoves();
  expect(possibleMoves).not.toBeEmpty();

  for (const position of expectedPositions) {
    const matchedMove = possibleMoves.find(
      (possibleMove) => possibleMove.distanceTo(position) === 0,
    );

    expect(matchedMove).not.toBeUndefined();
  }
});
