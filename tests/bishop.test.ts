import { expect, test } from "bun:test";
import { Board } from "../board";
import { Bishop, Color, King, Pawn } from "../pieces";
import { Position } from "../position/position";
import { isInLimit } from "../tools";

test("bishop possible positions", () => {
  const board = new Board([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Bishop("D4", Color.White),
    new Pawn("E5", Color.Black),
  ]);

  const bishop = board.getPieceAt("D4")!;
  expect(bishop).toBeDefined();
  const possibleMoves = bishop.getPossibleMoves();
  expect(possibleMoves).not.toBeEmpty();
  const { x, y } = bishop.position;

  const expectedPositions = [];
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
