import { expect, test } from "bun:test";
import { Color, CustomBoard, King, Pawn, Queen, Rook, Type } from "../src";

test("Should trigger 'boardChange' event when the board state changes", async () => {
  const { promise, resolve } = Promise.withResolvers<boolean>();

  const board = new CustomBoard(
    [
      new King("E1", Color.White),
      new King("E8", Color.Black),
      new Pawn("E2", Color.White),
    ],
    {
      onBoardChange: () => {
        resolve(true);
      },
    },
  );

  const move = await board.move("E2", "E4");
  expect(move).toHaveProperty("success", true);

  const boardChangeTriggered = await promise;
  expect(boardChangeTriggered).toBeTrue();
});

test("Should trigger 'check' event when a king is in check", async () => {
  const { promise, resolve } = Promise.withResolvers<Color | undefined>();

  const board = new CustomBoard(
    [
      new King("E1", Color.White),
      new King("E8", Color.Black),
      new Rook("F7", Color.White),
    ],
    {
      onCheck: (color) => {
        resolve(color);
      },
    },
  );

  const move = await board.move("F7", "F8");
  expect(move).toHaveProperty("success", true);

  const checkColor = await promise;
  expect(checkColor).toBe(Color.Black);
});

test("Should trigger 'checkmate' event when a king is in checkmate", async () => {
  const { promise, resolve } = Promise.withResolvers<Color | undefined>();

  const board = new CustomBoard(
    [
      new King("E1", Color.White),
      new King("E8", Color.Black),
      new Rook("A1", Color.White),
      new Rook("H7", Color.White),
    ],
    {
      onCheckMate: (color) => {
        resolve(color);
      },
    },
  );

  const move = await board.move("A1", "A8");
  expect(move).toHaveProperty("success", true);

  const checkmateColor = await promise;
  expect(checkmateColor).toBe(Color.Black);
});

test("Should trigger 'stalemate' event when the game is in stalemate", async () => {
  const { promise, resolve } = Promise.withResolvers<boolean>();

  const board = new CustomBoard(
    [
      new King("E1", Color.White),
      new King("A8", Color.Black),
      new Queen("B1", Color.White),
    ],
    {
      onStalemate: () => {
        resolve(true);
      },
    },
  );

  const move = await board.move("B1", "B6");
  expect(move).toHaveProperty("success", true);

  const stalemateTriggered = await promise;
  expect(stalemateTriggered).toBeTrue();
});

test("Should trigger 'move' event when a piece moves", async () => {
  const { promise, resolve } = Promise.withResolvers<boolean>();

  const board = new CustomBoard(
    [
      new King("E1", Color.White),
      new King("E8", Color.Black),
      new Pawn("E2", Color.White),
    ],
    {
      onMove: (startPosition, endPosition) => {
        resolve(
          startPosition.notation === "E2" && endPosition.notation === "E4",
        );
      },
    },
  );

  const move = await board.move("E2", "E4");
  expect(move).toHaveProperty("success", true);

  const moveTriggered = await promise;
  expect(moveTriggered).toBeTrue();
});

test("Should trigger 'capture' event when a piece captures another piece", async () => {
  const { promise, resolve } = Promise.withResolvers<boolean>();

  const board = new CustomBoard(
    [
      new King("E1", Color.White),
      new King("E8", Color.Black),
      new Pawn("A2", Color.White),
      new Pawn("B4", Color.Black),
    ],
    {
      onCapture: (startPosition, endPosition, capturedPosition) => {
        resolve(
          startPosition.notation === "B4" &&
            endPosition.notation === "A3" &&
            capturedPosition.notation === "A4",
        );
      },
    },
  );

  const move1 = await board.move("A2", "A4");
  const move2 = await board.move("B4", "A3");
  expect(move1).toHaveProperty("success", true);
  expect(move2).toHaveProperty("success", true);

  const captureTriggered = await promise;
  expect(captureTriggered).toBeTrue();
});

test("Should trigger 'promotion' event when a pawn is promoted", async () => {
  const { promise, resolve } = Promise.withResolvers<boolean>();

  const board = new CustomBoard(
    [
      new King("E1", Color.White),
      new King("E8", Color.Black),
      new Pawn("F7", Color.White),
    ],
    {
      getPromotionVariant: () => Type.Queen,
      onPromotion: (position, newType) => {
        resolve(position.notation === "F8" && newType === Type.Queen);
      },
    },
  );

  const move = await board.move("F7", "F8");
  expect(move).toHaveProperty("success", true);

  const promotionTriggered = await promise;
  expect(promotionTriggered).toBeTrue();
});

test("Should trigger 'castling' event when castling occurs", async () => {
  const { promise, resolve } = Promise.withResolvers<boolean>();

  const board = new CustomBoard(
    [
      new King("E1", Color.White),
      new King("E8", Color.Black),
      new Rook("H1", Color.White),
    ],
    {
      onCastling: (
        kingStartPosition,
        kingEndPosition,
        rookStartPosition,
        rookEndPosition,
      ) => {
        resolve(
          kingStartPosition.notation === "E1" &&
            kingEndPosition.notation === "G1" &&
            rookStartPosition.notation === "H1" &&
            rookEndPosition.notation === "F1",
        );
      },
    },
  );

  const move = await board.move("E1", "G1");
  expect(move).toHaveProperty("success", true);

  const castlingTriggered = await promise;
  expect(castlingTriggered).toBeTrue();
});
