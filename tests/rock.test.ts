import { expect, test } from "bun:test";
import { Color, Position, Rook } from "../src";

test("rook possible positions", () => {
  const rook = new Rook("D4", Color.White);
  const possibleMoves = rook.getPossibleMoves();
  expect(possibleMoves).not.toBeEmpty();
  const { x, y } = rook.position;

  const expectedPositions: Position[] = [];
  for (let i = 0; i <= 7; i++) {
    if (i !== x) {
      expectedPositions.push(
        new Position({ x: i, y }),
        new Position({ x, y: i }),
      );
    }
  }

  for (const position of expectedPositions) {
    const matchedMove = possibleMoves.find(
      (possibleMove) => possibleMove.distanceTo(position) === 0,
    );

    expect(matchedMove).not.toBeUndefined();
  }
});
