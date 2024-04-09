import { expect, test } from "bun:test";
import { Board } from "../board";
import { Color, King, Pawn } from "../pieces";

test("Should expect a turn from a different color after move", () => {
  const board = new Board([
    new King("A8", Color.Black),
    new King("A1", Color.White),
  ]);

  const blackMovedFirstSuccess = board.move("A8", "A7");
  const whiteMovedFirstSuccess = board.move("A1", "A2");
  const whiteMovedSecondSuccess = board.move("A2", "A3");
  const blackMovedSecondSuccess = board.move("A8", "A7");

  expect(blackMovedFirstSuccess).toBeFalse();
  expect(whiteMovedFirstSuccess).toBeTrue();
  expect(whiteMovedSecondSuccess).toBeFalse();
  expect(blackMovedSecondSuccess).toBeTrue();
});

test("En passant", () => {
  const board = new Board([
    new King("E1", Color.White),
    new King("E8", Color.Black),

    new Pawn("A2", Color.White),
    new Pawn("B4", Color.Black),
  ]);

  const pawnDoubleMoveSuccess = board.move("A2", "A4");
  const enPassantSuccess = board.move("B4", "A3");
  const capturedPiece = board.getPieceAt("A4");

  expect(pawnDoubleMoveSuccess).toBeTrue();
  expect(enPassantSuccess).toBeTrue();
  expect(capturedPiece).toBeUndefined();

  const board2 = new Board([
    new King("E1", Color.White),
    new King("E8", Color.Black),

    new Pawn("A4", Color.White),
    new Pawn("B4", Color.Black),
  ]);

  const enPassantWithoutDoubleMoveSuccess = board2.move("B4", "A3");

  expect(enPassantWithoutDoubleMoveSuccess).toBeFalse();
});
