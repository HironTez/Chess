import { expect, test } from "bun:test";
import { Bishop, Color, CustomBoard, King, Pawn, Position, Type } from "../src";
import { isInLimit } from "../src/helpers";

test("bishop possible positions", () => {
  const bishop = new Bishop("D4", Color.White);
  const possibleMoves = bishop.getPotentialMoves();
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

test("Bishop movement", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Bishop("C1", Color.White),
  ]);

  const bishopMove = await board.move("C1", "G5");

  expect(bishopMove.success).toBe(true);
});

test("Bishop capture", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Bishop("C1", Color.White),
    new Pawn("E3", Color.Black),
  ]);

  const bishopMove = await board.move("C1", "E3");
  const capturedPiece = board.getPieceAt("E3");

  expect(bishopMove.success).toBe(true);
  expect(capturedPiece).toHaveProperty("type", Type.Bishop);
});

test("Bishop illegal move", async () => {
  const board = new CustomBoard([
    new Bishop("C1", Color.White),
    new King("E8", Color.Black),
  ]);

  const bishopMove = await board.move("C1", "C4");

  expect(bishopMove.success).toBe(false);
  expect(board.getPieceAt("C1")).toHaveProperty("type", Type.Bishop);
  expect(board.getPieceAt("C1")).toHaveProperty("color", Color.White);
});
