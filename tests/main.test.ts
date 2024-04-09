import { expect, test } from "bun:test";
import { Board } from "../board";
import { Color, King, Pawn } from "../pieces";
import { Position } from "../position/position";

test("Should expect a turn from a different color after move", () => {
  const board = new Board([
    new King({ x: 0, y: 7 }, Color.Black),
    new King({ x: 0, y: 0 }, Color.White),
  ]);

  const blackMovedFirstSuccess = board.movePiece(
    { x: 0, y: 7 },
    { x: 0, y: 6 }
  );
  const whiteMovedFirstSuccess = board.movePiece(
    { x: 0, y: 0 },
    { x: 0, y: 1 }
  );
  const whiteMovedSecondSuccess = board.movePiece(
    { x: 0, y: 1 },
    { x: 0, y: 2 }
  );
  const blackMovedSecondSuccess = board.movePiece(
    { x: 0, y: 7 },
    { x: 0, y: 6 }
  );

  expect(blackMovedFirstSuccess).toBeFalse();
  expect(whiteMovedFirstSuccess).toBeTrue();
  expect(whiteMovedSecondSuccess).toBeFalse();
  expect(blackMovedSecondSuccess).toBeTrue();
});

test("En passant", () => {
  const board = new Board([
    new King({ x: 4, y: 0 }, Color.White),
    new King({ x: 4, y: 7 }, Color.Black),

    new Pawn({ x: 0, y: 1 }, Color.White),
    new Pawn({ x: 1, y: 3 }, Color.Black),
  ]);

  const pawnDoubleMoveSuccess = board.movePiece({ x: 0, y: 1 }, { x: 0, y: 3 });
  const enPassantSuccess = board.movePiece({ x: 1, y: 3 }, { x: 0, y: 2 });
  const capturedPiece = board.getPieceAt(new Position({ x: 0, y: 3 }));

  expect(pawnDoubleMoveSuccess).toBeTrue();
  expect(enPassantSuccess).toBeTrue();
  expect(capturedPiece).toBeUndefined();

  const board2 = new Board([
    new King({ x: 4, y: 0 }, Color.White),
    new King({ x: 4, y: 7 }, Color.Black),

    new Pawn({ x: 0, y: 3 }, Color.White),
    new Pawn({ x: 1, y: 3 }, Color.Black),
  ]);

  const enPassantWithoutDoubleMoveSuccess = board2.movePiece(
    { x: 1, y: 3 },
    { x: 0, y: 2 }
  );

  expect(enPassantWithoutDoubleMoveSuccess).toBeFalse();
});
