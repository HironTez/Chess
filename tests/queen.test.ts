import { expect, test } from "bun:test";
import { CustomBoard } from "../src/board";
import { Color, King, Pawn, Queen } from "../src/pieces";
import { Position } from "../src/position";
import { isInLimit } from "../tools";

test("queen possible positions", () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Queen("D4", Color.White),
    new Pawn("E5", Color.Black),
  ]);

  const queen = board.getPieceAt("D4")!;
  expect(queen).toBeDefined();
  const possibleMoves = queen.getPossibleMoves();
  expect(possibleMoves).not.toBeEmpty();
  const { x, y } = queen.position;

  const expectedPositions = [];
  for (let i = 0; i <= 7; i++) {
    if (i !== x) {
      const diagonalPoints = [
        { x: x + i, y: y + i },
        { x: x + i, y: y - i },
        { x: x - i, y: y + i },
        { x: x - i, y: y - i },
      ];

      for (const point of diagonalPoints) {
        if (isInLimit(0, point.x, 7) && isInLimit(0, point.y, 7)) {
          expectedPositions.push(new Position(point));
        }
      }

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
