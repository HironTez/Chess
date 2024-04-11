import { expect, test } from "bun:test";
import { Board } from "../board/board";
import { PreparedBoard } from "../board/preparedBoard";
import { Bishop, Color, King, Knight, Pawn, Queen, Rock } from "../pieces";
import { AxisValue } from "../position/position";

test("Should expect a turn from a different color after move", () => {
  const board = new Board([
    new King("A8", Color.Black),
    new King("A1", Color.White),
  ]);

  const blackMovedFirst = board.move("A8", "A7");
  const whiteMovedFirst = board.move("A1", "A2");
  const whiteMovedSecond = board.move("A2", "A3");
  const blackMovedSecond = board.move("A8", "A7");

  expect(blackMovedFirst).toBeFalse();
  expect(whiteMovedFirst).toBeTrue();
  expect(whiteMovedSecond).toBeFalse();
  expect(blackMovedSecond).toBeTrue();
});

test("En passant", () => {
  const board = new Board([
    new King("E1", Color.White),
    new King("E8", Color.Black),

    new Pawn("A2", Color.White),
    new Pawn("B4", Color.Black),
  ]);

  const pawnDoubleMoved = board.move("A2", "A4");
  const enPassantSuccess = board.move("B4", "A3");
  const capturedPiece = board.getPieceAt("A4");

  expect(pawnDoubleMoved).toBeTrue();
  expect(enPassantSuccess).toBeTrue();
  expect(capturedPiece).toBeNull();

  const board2 = new Board([
    new King("E1", Color.White),
    new King("E8", Color.Black),

    new Pawn("A4", Color.White),
    new Pawn("B4", Color.Black),
  ]);

  const enPassantWithoutDoubleMoveSuccess = board2.move("B4", "A3");

  expect(enPassantWithoutDoubleMoveSuccess).toBeFalse();
});

test("Should not move over other pieces", () => {
  const board = new Board([
    new King("E1", Color.White),
    new King("E8", Color.Black),

    new Pawn("A2", Color.White),
    new Rock("A1", Color.White),
  ]);

  const movedOverPiece = board.move("A1", "A3");

  expect(movedOverPiece).toBeFalse();
});

test("Should not move outside the board", () => {
  const board = new Board([
    new King("H8", Color.Black),
    new King("A1", Color.White),
  ]);

  // @ts-expect-error Trying to move outside the board
  const movedOutOfBounds = board.move("H8", "I9");

  expect(movedOutOfBounds).toBeFalse();
});

test("Should not move to square occupied by same color", () => {
  const board = new Board([
    new King("E1", Color.White),
    new King("E8", Color.Black),

    new Pawn("A2", Color.White),
    new Pawn("B2", Color.White),
  ]);

  const movedToOccupiedSquare = board.move("A2", "B2");

  expect(movedToOccupiedSquare).toBeFalse();
});

test("King cannot be in check after move", () => {
  const board = new Board([
    new King("E1", Color.White),
    new King("E8", Color.Black),

    new Rock("F8", Color.Black),
  ]);

  const movedToCheckedArea = board.move("E1", "F1");

  expect(movedToCheckedArea).toBeFalse();
});

test("King can only move one square", () => {
  const board = new Board([
    new King("E1", Color.White),
    new King("E8", Color.Black),
  ]);

  const movedTwoSquares = board.move("E1", "D3");
  const movedOneSquare = board.move("E1", "F1");

  expect(movedTwoSquares).toBeFalse();
  expect(movedOneSquare).toBeTrue();
});

test("Castling kingside", () => {
  const board = new Board([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rock("H1", Color.White),
  ]);

  const castled = board.move("E1", "G1");
  const king = board.getPieceAt("G1");
  const rock = board.getPieceAt("H1");

  expect(castled).toBeTrue();
  expect(king).toBeInstanceOf(King);
  expect(rock).toBeInstanceOf(Rock);
});

test("Castling queenside", () => {
  const board = new Board([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rock("A1", Color.White),
  ]);

  const castled = board.move("E1", "C1");
  const kingPosition = board.getPieceAt("C1");
  const rockPosition = board.getPieceAt("A1");

  expect(castled).toBeTrue();
  expect(kingPosition).toBeInstanceOf(King);
  expect(rockPosition).toBeInstanceOf(Rock);
});

test("Pawn promotion on reaching last rank", () => {
  const board = new Board([
    new King("E1", Color.White),
    new King("E8", Color.Black),

    new Pawn("A7", Color.White),
  ]);

  const pawnMoved = board.move("A7", "A8");
  const promotedPiece = board.getPieceAt("A8");

  expect(pawnMoved).toBeTrue();
  expect(promotedPiece).toBeInstanceOf(Queen);
});

test("Board should start with correct piece placement", () => {
  const board = new PreparedBoard();

  [
    { y: 0 as AxisValue, color: Color.White },
    { y: 7 as AxisValue, color: Color.Black },
  ].forEach(({ y, color }) => {
    for (let i = 0; i < 8; i++) {
      const pawnY = color === Color.White ? y + 1 : y - 1;
      const pawn = board.getPieceAt({
        x: i as AxisValue,
        y: pawnY as AxisValue,
      });

      expect(pawn).toBeInstanceOf(Pawn);
      expect(pawn).toHaveProperty("color", color);
    }

    const rock1 = board.getPieceAt({ x: 0, y });
    const rock2 = board.getPieceAt({ x: 7, y });
    const knight1 = board.getPieceAt({ x: 1, y });
    const knight2 = board.getPieceAt({ x: 6, y });
    const bishop1 = board.getPieceAt({ x: 2, y });
    const bishop2 = board.getPieceAt({ x: 5, y });
    const queen = board.getPieceAt({ x: 3, y });
    const king = board.getPieceAt({ x: 4, y });

    expect(rock1).toBeInstanceOf(Rock);
    expect(rock2).toBeInstanceOf(Rock);
    expect(knight1).toBeInstanceOf(Knight);
    expect(knight2).toBeInstanceOf(Knight);
    expect(bishop1).toBeInstanceOf(Bishop);
    expect(bishop2).toBeInstanceOf(Bishop);
    expect(queen).toBeInstanceOf(Queen);
    expect(king).toBeInstanceOf(King);

    expect(rock1).toHaveProperty("color", color);
    expect(rock2).toHaveProperty("color", color);
    expect(knight1).toHaveProperty("color", color);
    expect(knight2).toHaveProperty("color", color);
    expect(bishop1).toHaveProperty("color", color);
    expect(bishop2).toHaveProperty("color", color);
    expect(queen).toHaveProperty("color", color);
    expect(king).toHaveProperty("color", color);
  });
});
