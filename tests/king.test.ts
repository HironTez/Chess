import { expect, test } from "bun:test";
import { Color, CustomBoard, King, Pawn, Position, Type } from "../src";

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

test("King basic movement", async () => {
  const board = new CustomBoard([
    new King("E4", Color.White),
    new King("E8", Color.Black),
    new Pawn("H8", Color.Black),
  ]);

  const move = await board.move("E4", "E5");

  expect(move.success).toBe(true);
  expect(board.getPieceAt("E5")).toHaveProperty("type", Type.King);
});

test("King can only move one square", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Pawn("H8", Color.Black),
  ]);

  const moveTwoSquares = await board.move("E1", "D3");
  const moveOneSquare = await board.move("E1", "F1");

  expect(moveTwoSquares.success).toBe(false);
  expect(moveOneSquare.success).toBe(true);
});

test("King capture attacking piece", async () => {
  const board = new CustomBoard([
    new King("E4", Color.White),
    new King("E8", Color.Black),
    new Pawn("D5", Color.Black),
  ]);

  const move = await board.move("E4", "D5");
  const king = board.getPieceAt("D5");

  expect(move.success).toBe(true);
  expect(king).toHaveProperty("type", Type.King);
});
