import { expect, test } from "bun:test";
import { Color, CustomBoard, King, Pawn, Position, Queen, Type } from "../src";
import { isInLimit } from "../src/helpers";

test("queen possible positions", () => {
  const queen = new Queen("D4", Color.White);
  const possibleMoves = queen.getPotentialMoves();
  expect(possibleMoves).not.toBeEmpty();
  const { x, y } = queen.position;

  const expectedPositions: Position[] = [];
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

test("Queen basic movement", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Queen("D1", Color.White),
  ]);

  const queenMove = await board.move("D1", "H5");
  const queenAtNewPosition = board.getPieceAt("H5");

  expect(queenMove.success).toBe(true);
  expect(queenAtNewPosition).toHaveProperty("type", Type.Queen);
});

test("Queen capture piece", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Queen("D1", Color.White),
    new Pawn("H5", Color.Black),
  ]);

  const queenMove = await board.move("D1", "H5");
  const capturedPiece = board.getPieceAt("H5");

  expect(queenMove.success).toBe(true);
  expect(capturedPiece).toHaveProperty("type", Type.Queen);
  expect(capturedPiece).toHaveProperty("color", Color.White);
});

test("Queen illegal move", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Queen("D1", Color.White),
  ]);

  const queenMove = await board.move("D1", "E3");
  const queenAtNewPosition = board.getPieceAt("D1");

  expect(queenMove.success).toBe(false);
  expect(queenAtNewPosition).toHaveProperty("type", Type.Queen);
  expect(queenAtNewPosition).toHaveProperty("color", Color.White);
});
