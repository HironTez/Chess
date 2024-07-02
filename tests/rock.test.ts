import { expect, test } from "bun:test";
import { Color, CustomBoard, King, Position, Rook, Type } from "../src";

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

test("Rook basic movement", async () => {
  const board = new CustomBoard([
    new Rook("A1", Color.White),
    new King("E8", Color.Black),
  ]);

  const rookMoved = await board.move("A1", "A4");

  expect(rookMoved).toBeTrue();
  expect(board.getPieceAt("A4")).toHaveProperty("type", Type.Rook);
  expect(board.getPieceAt("A4")).toHaveProperty("color", Color.White);
});

test("Rook horizontal movement", async () => {
  const board = new CustomBoard([
    new Rook("A1", Color.White),
    new King("E8", Color.Black),
  ]);

  const rookMoved = await board.move("A1", "D1");

  expect(rookMoved).toBeTrue();
  expect(board.getPieceAt("D1")).toHaveProperty("type", Type.Rook);
  expect(board.getPieceAt("D1")).toHaveProperty("color", Color.White);
});

test("Rook vertical movement", async () => {
  const board = new CustomBoard([
    new Rook("A1", Color.White),
    new King("E8", Color.Black),
  ]);

  const rookMoved = await board.move("A1", "A8");

  expect(rookMoved).toBeTrue();
  expect(board.getPieceAt("A8")).toHaveProperty("type", Type.Rook);
  expect(board.getPieceAt("A8")).toHaveProperty("color", Color.White);
});

test("Rook capture piece", async () => {
  const board = new CustomBoard([
    new Rook("A1", Color.White),
    new King("E8", Color.Black),
    new Rook("A8", Color.Black),
  ]);

  const rookMoved = await board.move("A1", "A8");
  const capturedPiece = board.getPieceAt("A8");

  expect(rookMoved).toBeTrue();
  expect(capturedPiece).toHaveProperty("type", Type.Rook);
  expect(capturedPiece).toHaveProperty("color", Color.White);
});

test("Rook illegal move", async () => {
  const board = new CustomBoard([
    new Rook("A1", Color.White),
    new King("E8", Color.Black),
  ]);

  const rookMoved = await board.move("A1", "B2");

  expect(rookMoved).toBeFalse();
  expect(board.getPieceAt("A1")).toHaveProperty("type", Type.Rook);
  expect(board.getPieceAt("A1")).toHaveProperty("color", Color.White);
});
