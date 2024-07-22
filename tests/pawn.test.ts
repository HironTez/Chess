import { expect, test } from "bun:test";
import { Color, CustomBoard, King, Pawn, Position, Type } from "../src";

test("Pawn possible positions", () => {
  const expectedPositions = [
    new Position("A3"),
    new Position("B3"),
    new Position("C3"),
  ];

  const pawn = new Pawn("B2", Color.White);
  const possibleMoves = pawn.getPossibleMoves();
  expect(possibleMoves).not.toBeEmpty();

  for (const position of expectedPositions) {
    const matchedMove = possibleMoves.find(
      (possibleMove) => possibleMove.distanceTo(position) === 0,
    );

    expect(matchedMove).not.toBeUndefined();
  }
});

test("Pawn basic move", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Pawn("E2", Color.White),
  ]);

  const pawnMove = await board.move("E2", "E3");

  expect(pawnMove.success).toBe(true);
  expect(board.getPieceAt("E3")).toHaveProperty("type", Type.Pawn);
  expect(board.getPieceAt("E3")).toHaveProperty("color", Color.White);
});

test("Pawn double move from initial position", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Pawn("E2", Color.White),
  ]);

  const pawnMove = await board.move("E2", "E4");

  expect(pawnMove.success).toBe(true);
  expect(board.getPieceAt("E4")).toHaveProperty("type", Type.Pawn);
  expect(board.getPieceAt("E4")).toHaveProperty("color", Color.White);
});

test("Pawn capture piece", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Pawn("E4", Color.White),
    new Pawn("D5", Color.Black),
  ]);

  const pawnMove = await board.move("E4", "D5");
  const capturedPiece = board.getPieceAt("D5");

  expect(pawnMove.success).toBe(true);
  expect(capturedPiece).toHaveProperty("type", Type.Pawn);
  expect(capturedPiece).toHaveProperty("color", Color.White);
});

test("En passant", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Pawn("A2", Color.White),
    new Pawn("B4", Color.Black),
  ]);

  const pawnDoubleMove = await board.move("A2", "A4");
  const enPassantMove = await board.move("B4", "A3");
  const capturedPiece = board.getPieceAt("A4");

  expect(pawnDoubleMove.success).toBe(true);
  expect(enPassantMove.success).toBe(true);
  expect(capturedPiece).toBeUndefined();

  const board2 = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Pawn("A4", Color.White),
    new Pawn("B4", Color.Black),
  ]);

  const enPassantWithoutDoubleMove = await board2.move("B4", "A3");

  expect(enPassantWithoutDoubleMove.success).toBe(false);
});

test("Pawn promotion on reaching last rank", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Pawn("A7", Color.White),
  ]);

  const pawnMove = await board.move("A7", "A8");
  const promotedPiece = board.getPieceAt("A8");

  expect(pawnMove.success).toBe(true);
  expect(promotedPiece).toHaveProperty("type", Type.Queen);
});

test("Pawn promotion to Knight on reaching last rank", async () => {
  const board = new CustomBoard(
    [
      new King("E1", Color.White),
      new King("E8", Color.Black),
      new Pawn("A7", Color.White),
    ],
    { getPromotionVariant: () => Type.Knight },
  );

  const pawnMove = await board.move("A7", "A8");
  const promotedPiece = board.getPieceAt("A8");

  expect(pawnMove.success).toBe(true);
  expect(promotedPiece).toHaveProperty("type", Type.Knight);
});

test("Pawn promotion to Rook on reaching last rank", async () => {
  const board = new CustomBoard(
    [
      new King("E1", Color.White),
      new King("E8", Color.Black),
      new Pawn("A7", Color.White),
    ],
    {
      getPromotionVariant: () => Type.Rook,
    },
  );

  const pawnMove = await board.move("A7", "A8");
  const promotedPiece = board.getPieceAt("A8");

  expect(pawnMove.success).toBe(true);
  expect(promotedPiece).toHaveProperty("type", Type.Rook);
});

test("Pawn promotion to Bishop on reaching last rank", async () => {
  const board = new CustomBoard(
    [
      new King("E1", Color.White),
      new King("E8", Color.Black),
      new Pawn("A7", Color.White),
    ],
    {
      getPromotionVariant: () => Type.Bishop,
    },
  );

  const pawnMove = await board.move("A7", "A8");
  const promotedPiece = board.getPieceAt("A8");

  expect(pawnMove.success).toBe(true);
  expect(promotedPiece).toHaveProperty("type", Type.Bishop);
});

test("Pawn illegal move backward", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Pawn("E3", Color.White),
  ]);

  const pawnMove = await board.move("E3", "E2");

  expect(pawnMove.success).toBe(false);
  expect(board.getPieceAt("E3")).toHaveProperty("type", Type.Pawn);
  expect(board.getPieceAt("E3")).toHaveProperty("color", Color.White);
});

test("Pawn illegal double move not from initial position", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Pawn("E2", Color.White),
  ]);

  const pawnMove = await board.move("E2", "E3");
  const blackKingMove = await board.move("E8", "E7");
  const pawnDoubleMove = await board.move("E3", "E5");

  expect(pawnMove.success).toBe(true);
  expect(blackKingMove.success).toBe(true);
  expect(pawnDoubleMove.success).toBe(false);
  expect(board.getPieceAt("E3")).toHaveProperty("type", Type.Pawn);
  expect(board.getPieceAt("E3")).toHaveProperty("color", Color.White);
});

test("Pawn illegal capture forward", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Pawn("E4", Color.White),
    new Pawn("E5", Color.Black),
  ]);

  expect(
    board.getPossibleMoves("E4").find((position) => position.notation === "E5"),
  ).toBeUndefined();
  const pawnMove = await board.move("E4", "E5");
  expect(pawnMove.success).toBe(false);

  expect(board.getPieceAt("E4")).toHaveProperty("type", Type.Pawn);
  expect(board.getPieceAt("E4")).toHaveProperty("color", Color.White);

  expect(board.getPieceAt("E5")).toHaveProperty("type", Type.Pawn);
  expect(board.getPieceAt("E5")).toHaveProperty("color", Color.Black);
});
