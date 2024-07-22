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
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rook("A1", Color.White),
  ]);

  const rookMove = await board.move("A1", "A4");
  const rookAtNewPosition = board.getPieceAt("A4");

  expect(rookMove.success).toBe(true);
  expect(rookAtNewPosition).toHaveProperty("type", Type.Rook);
  expect(rookAtNewPosition).toHaveProperty("color", Color.White);
});

test("Rook horizontal movement", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rook("A1", Color.White),
  ]);

  const rookMove = await board.move("A1", "D1");
  const rookAtNewPosition = board.getPieceAt("D1");

  expect(rookMove.success).toBe(true);
  expect(rookAtNewPosition).toHaveProperty("type", Type.Rook);
  expect(rookAtNewPosition).toHaveProperty("color", Color.White);
});

test("Rook vertical movement", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rook("A1", Color.White),
  ]);

  const rookMove = await board.move("A1", "A5");
  const rookAtNewPosition = board.getPieceAt("A5");

  expect(rookMove.success).toBe(true);
  expect(rookAtNewPosition).toHaveProperty("type", Type.Rook);
  expect(rookAtNewPosition).toHaveProperty("color", Color.White);
});

test("Rook capture piece", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rook("A1", Color.White),
    new Rook("A8", Color.Black),
  ]);

  const rookMove = await board.move("A1", "A8");
  const rookAtNewPosition = board.getPieceAt("A8");

  expect(rookMove.success).toBe(true);
  expect(rookAtNewPosition).toHaveProperty("type", Type.Rook);
  expect(rookAtNewPosition).toHaveProperty("color", Color.White);
});

test("Rook illegal move", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rook("A1", Color.White),
  ]);

  const rookMove = await board.move("A1", "B2");
  const rookAtNewPosition = board.getPieceAt("B2");

  expect(rookMove.success).toBe(false);
  expect(rookAtNewPosition).toBeUndefined();
});
