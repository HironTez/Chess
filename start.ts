import { input, parseMoveInput, printBoard } from "./tools";

import { PreparedBoard, Type } from "./";

const board = new PreparedBoard({
  getPromotionVariant: () => Type.Queen,
  onCheck: (color) => {
    console.log(`${color} king is in check!`.toLocaleUpperCase());
  },
  onCheckMate: (color) => {
    console.log(`${color} king is in checkmate!`.toLocaleUpperCase());
  },
  onCheckResolve: () => {
    console.log("Check resolved");
  },
  onStalemate: (color) => {
    console.log(`${color} king is in stalemate!`.toLocaleUpperCase());
  },
  onBoardChange: (pieces) => {
    printBoard(pieces);
  },
  onMove: (startPosition, endPosition) => {
    console.log(
      `${startPosition.x},${startPosition.y} -> ${endPosition.x},${endPosition.y}`,
    );
  },
  onCapture: (startPosition, endPosition, capturedPosition) => {
    console.log(
      `${startPosition.x},${startPosition.y} -> ${endPosition.x},${endPosition.y} captured ${capturedPosition.x},${capturedPosition.y}`,
    );
  },
  onCastling: (
    kingStartPosition,
    kingEndPosition,
    rockStartPosition,
    rockEndPosition,
  ) => {
    console.log(
      `${kingStartPosition.x},${kingStartPosition.y} -> ${kingEndPosition.x},${kingEndPosition.y} castling ${rockStartPosition.x},${rockStartPosition.y} -> ${rockEndPosition.x},${rockEndPosition.y}`,
    );
  },
  onPromotion: (position) => {
    console.log(`${position.x},${position.y} promoted to Queen`);
  },
});

const main = async () => {
  while (true) {
    const moveInput = await input("Enter your move (example: a2 - a4): ");
    const { startPosition, endPosition } = parseMoveInput(moveInput);

    if (!startPosition?.isValid || !endPosition?.isValid) {
      console.error("Invalid input! Try again.");
      continue;
    }

    const moved = await board.move(startPosition, endPosition);
    if (!moved) {
      console.error("Invalid move! Try again.");
      continue;
    }
  }
};

main();
