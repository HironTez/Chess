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
  expect(move.success).toBe(true);

  const boardChangeTriggered = await promise;
  expect(boardChangeTriggered).toBe(true);
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
  expect(move.success).toBe(true);

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
      onCheckmate: (color) => {
        resolve(color);
      },
    },
  );

  const move = await board.move("A1", "A8");
  expect(move.success).toBe(true);

  const checkmateColor = await promise;
  expect(checkmateColor).toBe(Color.Black);
});

test("Should trigger 'draw' event when the game is in draw", async () => {
  const { promise, resolve } = Promise.withResolvers<boolean>();

  const board = new CustomBoard(
    [
      new King("E1", Color.White),
      new King("A8", Color.Black),
      new Queen("B1", Color.White),
    ],
    {
      onDraw: () => {
        resolve(true);
      },
    },
  );

  const move = await board.move("B1", "B6");
  expect(move.success).toBe(true);

  const drawTriggered = await promise;
  expect(drawTriggered).toBe(true);
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
  expect(move.success).toBe(true);

  const moveTriggered = await promise;
  expect(moveTriggered).toBe(true);
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
  expect(move1.success).toBe(true);
  expect(move2.success).toBe(true);

  const captureTriggered = await promise;
  expect(captureTriggered).toBe(true);
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
  expect(move.success).toBe(true);

  const promotionTriggered = await promise;
  expect(promotionTriggered).toBe(true);
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
  expect(move.success).toBe(true);

  const castlingTriggered = await promise;
  expect(castlingTriggered).toBe(true);
});

test("Should trigger 'check resolve' event when check is resolved", async () => {
  const { promise, resolve } = Promise.withResolvers<Color | undefined>();
  const { promise: promise2, resolve: resolve2 } =
    Promise.withResolvers<boolean>();

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
      onCheckResolve: () => {
        resolve2(true);
      },
    },
  );

  const move = await board.move("F7", "F8");
  expect(move.success).toBe(true);

  const checkColor = await promise;
  expect(checkColor).toBe(Color.Black);

  const move2 = await board.move("E8", "F8");
  expect(move2.success).toBe(true);

  const checkResolveTriggered = await promise2;
  expect(checkResolveTriggered).toBe(true);
  expect(board.checkColor).toBeNull();
});

test("Should trigger 'checkmate resolve' event when checkmate is undone", async () => {
  const { promise, resolve } = Promise.withResolvers<Color | undefined>();
  const { promise: promise2, resolve: resolve2 } =
    Promise.withResolvers<boolean>();

  const board = new CustomBoard(
    [
      new King("E1", Color.White),
      new King("E8", Color.Black),
      new Rook("A1", Color.White),
      new Rook("H7", Color.White),
    ],
    {
      onCheckmate: (color) => {
        resolve(color);
      },
      onCheckmateResolve: () => {
        resolve2(true);
      },
    },
  );

  const move = await board.move("A1", "A8");
  expect(move.success).toBe(true);

  const checkmateColor = await promise;
  expect(checkmateColor).toBe(Color.Black);

  const undo = board.undo();
  expect(undo.success).toBe(true);
  const checkmateResolveTriggered = await promise2;
  expect(checkmateResolveTriggered).toBe(true);
  expect(board.checkmateColor).toBeNull();
});

test("Should trigger 'draw resolve' event when draw is undone", async () => {
  const { promise, resolve } = Promise.withResolvers<boolean>();
  const { promise: promise2, resolve: resolve2 } =
    Promise.withResolvers<boolean>();

  const board = new CustomBoard(
    [
      new King("E1", Color.White),
      new King("A8", Color.Black),
      new Queen("B1", Color.White),
    ],
    {
      onDraw: () => {
        resolve(true);
      },
      onDrawResolve: () => {
        resolve2(true);
      },
    },
  );

  const move = await board.move("B1", "B6");
  expect(move.success).toBe(true);

  const drawTriggered = await promise;
  expect(drawTriggered).toBe(true);

  const undo = board.undo();
  expect(undo.success).toBe(true);
  const drawResolveTriggered = await promise2;
  expect(drawResolveTriggered).toBe(true);
  expect(board.isDraw).toBe(false);
});
