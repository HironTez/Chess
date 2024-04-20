import { expect, test } from "bun:test";
import { Position } from "../src";
import { isInLimit } from "../src/helpers";
import { Bishop, Color } from "../src/pieces";

test("bishop possible positions", () => {
  const bishop = new Bishop("D4", Color.White);
  const possibleMoves = bishop.getPossibleMoves();
  expect(possibleMoves).not.toBeEmpty();
  const { x, y } = bishop.position;

  const expectedPositions: Position[] = [];
  for (let i = 0; i <= 7; i++) {
    if (i !== x) {
      const points = [
        { x: x + i, y: y + i },
        { x: x + i, y: y - i },
        { x: x - i, y: y + i },
        { x: x - i, y: y - i },
      ];

      for (const point of points) {
        if (isInLimit(0, point.x, 7) && isInLimit(0, point.y, 7)) {
          expectedPositions.push(new Position(point));
        }
      }
    }
  }

  for (const position of expectedPositions) {
    const matchedMove = possibleMoves.find(
      (possibleMove) => possibleMove.distanceTo(position) === 0,
    );

    expect(matchedMove).not.toBeUndefined();
  }
});
