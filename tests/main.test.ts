import { expect, test } from "bun:test";
import {
  Bishop,
  Board,
  Color,
  CustomBoard,
  King,
  Knight,
  MoveType,
  Pawn,
  Position,
  Queen,
  Rook,
  Type,
} from "../src";

test("Should expect a turn from a different color after move", async () => {
  const board = new CustomBoard([
    new King("A1", Color.White),
    new King("A8", Color.Black),
    new Pawn("H1", Color.White),
  ]);

  const blackMoveFirst = await board.move("A8", "A7");
  const whiteMoveFirst = await board.move("A1", "A2");
  const whiteMoveSecond = await board.move("A2", "A3");
  const blackMoveSecond = await board.move("A8", "A7");

  expect(blackMoveFirst).toHaveProperty("success", false);
  expect(whiteMoveFirst).toHaveProperty("success", true);
  expect(whiteMoveSecond).toHaveProperty("success", false);
  expect(blackMoveSecond).toHaveProperty("success", true);
});

test("Should not move over other pieces", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Pawn("A2", Color.White),
    new Rook("A1", Color.White),
  ]);

  const moveOverPiece = await board.move("A1", "A3");

  expect(moveOverPiece).toHaveProperty("success", false);
});

test("Should not move outside the board", async () => {
  const board = new CustomBoard([
    new King("A1", Color.White),
    new King("A8", Color.Black),
    new Rook("H1", Color.White),
  ]);

  const moveOutOfBounds = await board.move("H1", "I9");

  expect(moveOutOfBounds).toHaveProperty("success", false);
});

test("Should not move to square occupied by same color", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Pawn("A2", Color.White),
    new Pawn("B2", Color.White),
  ]);

  const moveToOccupiedSquare = await board.move("A2", "B2");

  expect(moveToOccupiedSquare).toHaveProperty("success", false);
});

test("King cannot be in check after move", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rook("F8", Color.Black),
  ]);

  const moveToCheckedArea = await board.move("E1", "F1");

  expect(moveToCheckedArea).toHaveProperty("success", false);
});

test("Castling kingside", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rook("H1", Color.White),
  ]);

  const castlingMove = await board.move("E1", "G1");
  const king = board.getPieceAt("G1");
  const rook = board.getPieceAt("F1");

  expect(castlingMove).toHaveProperty("success", true);
  expect(king).toHaveProperty("type", Type.King);
  expect(rook).toHaveProperty("type", Type.Rook);
});

test("Castling queenside", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rook("A1", Color.White),
  ]);

  const castlingMove = await board.move("E1", "C1");
  const kingPosition = board.getPieceAt("C1");
  const rookPosition = board.getPieceAt("D1");

  expect(castlingMove).toHaveProperty("success", true);
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

  const castlingMove = await board.move("E1", "C1");
  const kingPosition = board.getPieceAt("E1");
  const rookPosition = board.getPieceAt("A1");

  expect(castlingMove).toHaveProperty("success", false);
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

  const castlingMove = await board.move("E1", "C1");
  const kingPosition = board.getPieceAt("E1");
  const rookPosition = board.getPieceAt("A1");

  expect(castlingMove).toHaveProperty("success", false);
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

  const checkMove = await board.move("D8", "E8");
  const castlingMove = await board.move("E1", "C1");
  const kingPosition = board.getPieceAt("E1");
  const rookPosition = board.getPieceAt("A1");

  expect(checkMove).toHaveProperty("success", true);
  expect(board.checkColor).toBe(Color.Black);
  expect(castlingMove).toHaveProperty("success", false);
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

  const rookMove = await board.move("A1", "A8");

  expect(rookMove).toHaveProperty("success", true);
  expect(board.checkColor).toBe(Color.Black);
  expect(board.checkmateColor).toBeNull();
});

test("Should detect checkmate", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rook("A1", Color.White),
    new Rook("H7", Color.White),
  ]);

  const rookMove = await board.move("A1", "A8");

  expect(rookMove).toHaveProperty("success", true);
  expect(board.checkColor).toBe(Color.Black);
  expect(board.checkmateColor).toBe(Color.Black);
});

test("Should detect draw", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("A8", Color.Black),
    new Queen("B1", Color.White),
  ]);

  const queenMove = await board.move("B1", "B6");

  expect(queenMove).toHaveProperty("success", true);
  expect(board.checkColor).toBeNull();
  expect(board.checkmateColor).toBeNull();
  expect(board.isDraw).toBe(true);
});

test("Castling when Rook has move", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rook("H1", Color.White),
  ]);

  await board.move("H1", "H2");
  await board.move("H2", "H1");

  const castlingMove = await board.move("E1", "G1");

  expect(castlingMove).toHaveProperty("success", false);
});

test("Castling when King has move", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rook("H1", Color.White),
  ]);

  await board.move("E1", "E2");
  await board.move("E2", "E1");

  const castlingMove = await board.move("E1", "G1");

  expect(castlingMove).toHaveProperty("success", false);
});

test("King cannot stay in check", async () => {
  const board = new CustomBoard([
    new King("E4", Color.White),
    new King("E8", Color.Black),
    new Rook("E5", Color.Black),
  ]);

  const kingMove = await board.move("E4", "E3");

  expect(kingMove).toHaveProperty("success", false);
  expect(board.getPieceAt("E4")).toHaveProperty("type", Type.King);
  expect(board.getPieceAt("E4")).toHaveProperty("color", Color.White);
});

test("Should detect draw with only two kings remaining", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
  ]);

  const draw = board.isDraw;

  expect(draw).toBeTrue();
});

test("Move should contain correct start and end positions", async () => {
  const board = new CustomBoard([
    new King("A1", Color.White),
    new King("A8", Color.Black),
    new Pawn("H1", Color.White),
  ]);

  const move = await board.move("H1", "H2");

  expect(move).toHaveProperty("success", true);
  expect(move).toHaveProperty("type", MoveType.Move);
  if (move.success) {
    expect(move.startPosition).toBeInstanceOf(Position);
    expect(move.endPosition).toBeInstanceOf(Position);
    expect(move.startPosition.notation).toBe("H1");
    expect(move.endPosition.notation).toBe("H2");
  }
});

test("Should contain correct capture position", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Pawn("A2", Color.White),
    new Pawn("B4", Color.Black),
  ]);

  await board.move("A2", "A4");
  const move = await board.move("B4", "A3");

  expect(move).toHaveProperty("success", true);
  expect(move).toHaveProperty("type", MoveType.Capture);
  if (move.success && move.type === MoveType.Capture) {
    expect(move.capturedPosition).toBeInstanceOf(Position);
    expect(move.capturedPosition.notation).toBe("A4");
  }
});

test("Should contain correct castling positions", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rook("H1", Color.White),
  ]);

  const move = await board.move("E1", "G1");

  expect(move).toHaveProperty("success", true);
  expect(move).toHaveProperty("type", MoveType.Castling);
  if (move.success && move.type === MoveType.Castling) {
    expect(move.startPosition).toBeInstanceOf(Position);
    expect(move.endPosition).toBeInstanceOf(Position);
    expect(move.castlingRookStartPosition).toBeInstanceOf(Position);
    expect(move.castlingRookEndPosition).toBeInstanceOf(Position);
    expect(move.startPosition.notation).toBe("E1");
    expect(move.endPosition.notation).toBe("G1");
    expect(move.castlingRookStartPosition.notation).toBe("H1");
    expect(move.castlingRookEndPosition.notation).toBe("F1");
  }
});

test("Should contain correct promotion type", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Pawn("A7", Color.White),
  ]);

  const move = await board.move("A7", "A8");

  expect(move).toHaveProperty("success", true);
  expect(move).toHaveProperty("type", MoveType.Promotion);
  if (move.success && move.type === MoveType.Promotion) {
    expect(move.newPieceType).toBe(Type.Queen);
  }
});

test("Should save moves to history", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Pawn("A2", Color.White),
    new Pawn("B4", Color.Black),
  ]);

  const move1 = await board.move("A2", "A4");
  const move2 = await board.move("B4", "A3");

  expect(move1).toHaveProperty("success", true);
  expect(move2).toHaveProperty("success", true);
  expect(move1.success && move1.startPosition.notation).not.toBeUndefined();
  expect(move2.success && move2.startPosition.notation).not.toBeUndefined();

  if (
    move1.success &&
    move2.success &&
    move1.startPosition.notation &&
    move2.startPosition.notation
  ) {
    const history = board.history;
    expect(history).toHaveLength(2);
    expect(history.at(0)?.startPosition.notation).toBe(
      move1.startPosition.notation,
    );
    expect(history.at(1)?.startPosition.notation).toBe(
      move2.startPosition.notation,
    );
  }
});

test("ID of a piece should stay the same", async () => {
  const pawn = new Pawn("A7", Color.White);

  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    pawn,
  ]);

  const move = await board.move("A7", "A8");

  expect(move).toHaveProperty("success", true);
  if (move.success) {
    expect(move.pieceId).toBe(pawn.id);
  }
});

test("Should be a draw when a position repeats 3 times (threefold repetition)", async () => {
  const board = new CustomBoard([
    new King("A1", Color.White),
    new King("A8", Color.Black),
    new Knight("H1", Color.White),
    new Knight("H8", Color.Black),
  ]);

  await board.move("H1", "G3");
  await board.move("H8", "G6");
  await board.move("G3", "H1");
  await board.move("G6", "H8");
  await board.move("H1", "G3");
  await board.move("H8", "G6");
  await board.move("G3", "H1");
  await board.move("G6", "H8");
  await board.move("H1", "G3");

  expect(board.isDraw).toBeTrue();
});

test("Should not be a draw when a position repeats 3 times but an irreversible move happens: king moves for the first time making castling impossible", async () => {
  const board = new CustomBoard([
    new King("A1", Color.White),
    new King("A8", Color.Black),
    new Knight("H1", Color.White),
  ]);

  await board.move("H1", "G3");
  await board.move("A8", "B8");
  await board.move("G3", "H1");
  await board.move("B8", "A8");
  await board.move("H1", "G3");
  await board.move("A8", "B8");
  await board.move("G3", "H1");
  await board.move("B8", "A8");
  await board.move("H1", "G3");

  expect(board.isDraw).toBeFalse();
});

test("Should not be a draw when a position repeats 3 times but an irreversible move happens: rook moves for the first time making castling impossible on this side", async () => {
  const board = new CustomBoard([
    new King("A1", Color.White),
    new King("A8", Color.Black),
    new Knight("H1", Color.White),
    new Rook("H8", Color.Black),
  ]);

  await board.move("H1", "G3");
  await board.move("H8", "H7");
  await board.move("G3", "H1");
  await board.move("H7", "H8");
  await board.move("H1", "G3");
  await board.move("H8", "H7");
  await board.move("G3", "H1");
  await board.move("H7", "H8");
  await board.move("H1", "G3");

  expect(board.isDraw).toBeFalse();
});

test("Should undo move", async () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Pawn("A2", Color.White),
    new Pawn("B4", Color.Black),
  ]);

  const pawnDoubleMove = await board.move("A2", "A4");
  const enPassantMove = await board.move("B4", "A3");
  const capturedPiece = board.getPieceAt("A4");

  expect(pawnDoubleMove).toHaveProperty("success", true);
  expect(enPassantMove).toHaveProperty("success", true);
  expect(capturedPiece).toBeUndefined();

  const undone = board.undo();
  expect(undone).toBeTrue();

  const pawnOnStartPosition = board.getPieceAt("B4");
  const pawnOnEndPosition = board.getPieceAt("A3");
  const restoredPiece = board.getPieceAt("A4");

  expect(pawnOnStartPosition).toHaveProperty("type", Type.Pawn);
  expect(pawnOnStartPosition).toHaveProperty("color", Color.Black);
  expect(pawnOnEndPosition).toBeUndefined();
  expect(restoredPiece).toHaveProperty("type", Type.Pawn);
  expect(restoredPiece).toHaveProperty("color", Color.White);
});

test("Pieces can cover king from check", async () => {
  const board = new CustomBoard([
    new King("A1", Color.White),
    new King("H8", Color.Black),
    new Bishop("G5", Color.White),
    new Pawn("G8", Color.Black),
    new Pawn("H7", Color.Black),
  ]);

  await board.move("G5", "F6");

  expect(board.checkColor).toBe(Color.Black);
  expect(board.checkmateColor).toBeNull();
});
