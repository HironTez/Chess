import { expect, test } from "bun:test";
import { Color, Knight, Position } from "../src";

test("knight possible positions", () => {
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

  const knight = new Knight("C4", Color.White);
  const possibleMoves = knight.getPossibleMoves();
  expect(possibleMoves).not.toBeEmpty();

  for (const position of expectedPositions) {
    const matchedMove = possibleMoves.find(
      (possibleMove) => possibleMove.distanceTo(position) === 0,
    );

    expect(matchedMove).not.toBeUndefined();
  }
});
