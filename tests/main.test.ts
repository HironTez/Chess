import { expect, test } from "bun:test";
import {
  Board,
  Color,
  CustomBoard,
  King,
  Pawn,
  Queen,
  Rook,
  Type,
} from "../src";

test("Should expect a turn from a different color after move", async () => {
  const board = new CustomBoard([
    new King("A8", Color.Black),
    new King("A1", Color.White),
  ]);

  const blackMovedFirst = await board.move("A8", "A7");
  const whiteMovedFirst = await board.move("A1", "A2");
  const whiteMovedSecond = await board.move("A2", "A3");
  const blackMovedSecond = await board.move("A8", "A7");

  expect(blackMovedFirst).toBeFalse();
  expect(whiteMovedFirst).toBeTrue();
  expect(whiteMovedSecond).toBeFalse();
  expect(blackMovedSecond).toBeTrue();
});

test("Should not move over other pieces", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),

    new Pawn("A2", Color.White),
    new Rook("A1", Color.White),
  ]);

  const movedOverPiece = await board.move("A1", "A3");

  expect(movedOverPiece).toBeFalse();
});

test("Should not move outside the board", async () => {
  const board = new CustomBoard([
    new King("H8", Color.Black),
    new King("A1", Color.White),
  ]);

  // @ts-expect-error Trying to move outside the board
  const movedOutOfBounds = await board.move("H8", "I9");

  expect(movedOutOfBounds).toBeFalse();
});

test("Should not move to square occupied by same color", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),

    new Pawn("A2", Color.White),
    new Pawn("B2", Color.White),
  ]);

  const movedToOccupiedSquare = await board.move("A2", "B2");

  expect(movedToOccupiedSquare).toBeFalse();
});

test("King cannot be in check after move", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),

    new Rook("F8", Color.Black),
  ]);

  const movedToCheckedArea = await board.move("E1", "F1");

  expect(movedToCheckedArea).toBeFalse();
});

test("Castling kingside", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rook("H1", Color.White),
  ]);

  const castled = await board.move("E1", "G1");
  const king = board.getPieceAt("G1");
  const rook = board.getPieceAt("F1");

  expect(castled).toBeTrue();
  expect(king).toHaveProperty("type", Type.King);
  expect(rook).toHaveProperty("type", Type.Rook);
});

test("Castling queenside", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rook("A1", Color.White),
  ]);

  const castled = await board.move("E1", "C1");
  const kingPosition = board.getPieceAt("C1");
  const rookPosition = board.getPieceAt("D1");

  expect(castled).toBeTrue();
  expect(kingPosition).toHaveProperty("type", Type.King);
  expect(rookPosition).toHaveProperty("type", Type.Rook);
});

test("Castling through check", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rook("A1", Color.White),
    new Rook("D8", Color.Black),
  ]);

  const castled = await board.move("E1", "C1");
  const kingPosition = board.getPieceAt("E1");
  const rookPosition = board.getPieceAt("A1");

  expect(castled).toBeFalse();
  expect(kingPosition).toHaveProperty("type", Type.King);
  expect(rookPosition).toHaveProperty("type", Type.Rook);
});

test("Castling to checked square", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rook("A1", Color.White),
    new Rook("C8", Color.Black),
  ]);

  const castled = await board.move("E1", "C1");
  const kingPosition = board.getPieceAt("E1");
  const rookPosition = board.getPieceAt("A1");

  expect(castled).toBeFalse();
  expect(kingPosition).toHaveProperty("type", Type.King);
  expect(rookPosition).toHaveProperty("type", Type.Rook);
});

test("Castling when check", async () => {
  const board = new CustomBoard([
    new King("E1", Color.Black),
    new King("F8", Color.White),
    new Rook("A1", Color.Black),
    new Rook("D8", Color.White),
  ]);

  const checked = await board.move("D8", "E8");
  const castled = await board.move("E1", "C1");
  const kingPosition = board.getPieceAt("E1");
  const rookPosition = board.getPieceAt("A1");

  expect(checked).toBeTrue();
  expect(board.check).toBe(Color.Black);
  expect(castled).toBeFalse();
  expect(kingPosition).toHaveProperty("type", Type.King);
  expect(rookPosition).toHaveProperty("type", Type.Rook);
});

test("CustomBoard should start with correct piece placement", () => {
  const board = new Board();

  [
    { y: 0, color: Color.White },
    { y: 7, color: Color.Black },
  ].forEach(({ y, color }) => {
    for (let i = 0; i < 8; i++) {
      const pawnY = color === Color.White ? y + 1 : y - 1;
      const pawn = board.getPieceAt({
        x: i,
        y: pawnY,
      });

      expect(pawn).toHaveProperty("type", Type.Pawn);
      expect(pawn).toHaveProperty("color", color);
    }

    const rook1 = board.getPieceAt({ x: 0, y });
    const rook2 = board.getPieceAt({ x: 7, y });
    const knight1 = board.getPieceAt({ x: 1, y });
    const knight2 = board.getPieceAt({ x: 6, y });
    const bishop1 = board.getPieceAt({ x: 2, y });
    const bishop2 = board.getPieceAt({ x: 5, y });
    const queen = board.getPieceAt({ x: 3, y });
    const king = board.getPieceAt({ x: 4, y });

    expect(rook1).toHaveProperty("type", Type.Rook);
    expect(rook2).toHaveProperty("type", Type.Rook);
    expect(knight1).toHaveProperty("type", Type.Knight);
    expect(knight2).toHaveProperty("type", Type.Knight);
    expect(bishop1).toHaveProperty("type", Type.Bishop);
    expect(bishop2).toHaveProperty("type", Type.Bishop);
    expect(queen).toHaveProperty("type", Type.Queen);
    expect(king).toHaveProperty("type", Type.King);

    expect(rook1).toHaveProperty("color", color);
    expect(rook2).toHaveProperty("color", color);
    expect(knight1).toHaveProperty("color", color);
    expect(knight2).toHaveProperty("color", color);
    expect(bishop1).toHaveProperty("color", color);
    expect(bishop2).toHaveProperty("color", color);
    expect(queen).toHaveProperty("color", color);
    expect(king).toHaveProperty("color", color);
  });
});

test("Should detect check", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rook("A1", Color.White),
  ]);

  const rookMoved = await board.move("A1", "A8");

  expect(rookMoved).toBeTrue();
  expect(board.check).toBe(Color.Black);
  expect(board.checkmate).toBeUndefined();
});

test("Should detect checkmate", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rook("A1", Color.White),
    new Rook("H7", Color.White),
  ]);

  const rookMoved = await board.move("A1", "A8");

  expect(rookMoved).toBeTrue();
  expect(board.check).toBe(Color.Black);
  expect(board.checkmate).toBe(Color.Black);
});

test("Should detect stalemate", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("A8", Color.Black),
    new Queen("B1", Color.White),
  ]);

  const queenMoved = await board.move("B1", "B6");

  expect(queenMoved).toBeTrue();
  expect(board.check).toBeUndefined();
  expect(board.checkmate).toBeUndefined();
  expect(board.stalemate).toBe(Color.Black);
});

test("Castling when Rook has moved", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rook("H1", Color.White),
  ]);

  await board.move("H1", "H2");
  await board.move("H2", "H1");

  const castled = await board.move("E1", "G1");

  expect(castled).toBeFalse();
});

test("Castling when King has moved", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rook("H1", Color.White),
  ]);

  await board.move("E1", "E2");
  await board.move("E2", "E1");

  const castled = await board.move("E1", "G1");

  expect(castled).toBeFalse();
});

test("King cannot stay in check", async () => {
  const board = new CustomBoard([
    new King("E4", Color.White),
    new King("E8", Color.Black),
    new Rook("E5", Color.Black),
  ]);

  const kingMoved = await board.move("E4", "E3");

  expect(kingMoved).toBeFalse();
  expect(board.getPieceAt("E4")).toHaveProperty("type", Type.King);
  expect(board.getPieceAt("E4")).toHaveProperty("color", Color.White);
});
