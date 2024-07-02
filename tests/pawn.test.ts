import { expect, test } from "bun:test";
import { Color, CustomBoard, King, Pawn, Position, Type } from "../src";

test("pawn possible positions", () => {
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
    new Pawn("E2", Color.White),
    new King("E8", Color.Black),
    new King("E1", Color.White),
  ]);

  const pawnMoved = await board.move("E2", "E3");

  expect(pawnMoved).toBeTrue();
  expect(board.getPieceAt("E3")).toHaveProperty("type", Type.Pawn);
  expect(board.getPieceAt("E3")).toHaveProperty("color", Color.White);
});

test("Pawn double move from initial position", async () => {
  const board = new CustomBoard([
    new Pawn("E2", Color.White),
    new King("E8", Color.Black),
    new King("E1", Color.White),
  ]);

  const pawnMoved = await board.move("E2", "E4");

  expect(pawnMoved).toBeTrue();
  expect(board.getPieceAt("E4")).toHaveProperty("type", Type.Pawn);
  expect(board.getPieceAt("E4")).toHaveProperty("color", Color.White);
});

test("Pawn capture piece", async () => {
  const board = new CustomBoard([
    new Pawn("E4", Color.White),
    new King("E8", Color.Black),
    new King("E1", Color.White),
    new Pawn("D5", Color.Black),
  ]);

  const pawnMoved = await board.move("E4", "D5");
  const capturedPiece = board.getPieceAt("D5");

  expect(pawnMoved).toBeTrue();
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

  const pawnDoubleMoved = await board.move("A2", "A4");
  const enPassantSuccess = await board.move("B4", "A3");
  const capturedPiece = board.getPieceAt("A4");

  expect(pawnDoubleMoved).toBeTrue();
  expect(enPassantSuccess).toBeTrue();
  expect(capturedPiece).toBeUndefined();

  const board2 = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),

    new Pawn("A4", Color.White),
    new Pawn("B4", Color.Black),
  ]);

  const enPassantWithoutDoubleMoveSuccess = await board2.move("B4", "A3");

  expect(enPassantWithoutDoubleMoveSuccess).toBeFalse();
});

test("Pawn promotion on reaching last rank", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),

    new Pawn("A7", Color.White),
  ]);

  const pawnMoved = await board.move("A7", "A8");
  const promotedPiece = board.getPieceAt("A8");

  expect(pawnMoved).toBeTrue();
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

  const pawnMoved = await board.move("A7", "A8");
  const promotedPiece = board.getPieceAt("A8");

  expect(pawnMoved).toBeTrue();
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

  const pawnMoved = await board.move("A7", "A8");
  const promotedPiece = board.getPieceAt("A8");

  expect(pawnMoved).toBeTrue();
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

  const pawnMoved = await board.move("A7", "A8");
  const promotedPiece = board.getPieceAt("A8");

  expect(pawnMoved).toBeTrue();
  expect(promotedPiece).toHaveProperty("type", Type.Bishop);
});

test("Pawn illegal move backward", async () => {
  const board = new CustomBoard([
    new Pawn("E3", Color.White),
    new King("E8", Color.Black),
    new King("E1", Color.White),
  ]);

  const pawnMoved = await board.move("E3", "E2");

  expect(pawnMoved).toBeFalse();
  expect(board.getPieceAt("E3")).toHaveProperty("type", Type.Pawn);
  expect(board.getPieceAt("E3")).toHaveProperty("color", Color.White);
});

test("Pawn illegal double move not from initial position", async () => {
  const board = new CustomBoard([
    new Pawn("E2", Color.White),
    new King("E8", Color.Black),
    new King("E1", Color.White),
  ]);

  const pawnMoved = await board.move("E2", "E3");
  const blackKingMoved = await board.move("E8", "E7");
  const pawnDoubleMoved = await board.move("E3", "E5");

  expect(pawnMoved).toBeTrue();
  expect(blackKingMoved).toBeTrue();
  expect(pawnDoubleMoved).toBeFalse();
  expect(board.getPieceAt("E3")).toHaveProperty("type", Type.Pawn);
  expect(board.getPieceAt("E3")).toHaveProperty("color", Color.White);
});
