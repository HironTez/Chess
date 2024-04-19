import { input, printBoard } from "./tools";

import { PreparedBoard } from "./board/preparedBoard";
import { Type } from "./pieces";
import { Position } from "./position/position";

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
    const positions = moveInput.match(/([a-hA-H][1-8]).*([a-hA-H][1-8])/);
    const startPositionParsed = positions?.at(1);
    const endPositionParsed = positions?.at(2);
    const startPosition = startPositionParsed
      ? new Position(startPositionParsed)
      : undefined;
    const endPosition = endPositionParsed
      ? new Position(endPositionParsed)
      : undefined;

    if (!startPosition?.isValid || !endPosition?.isValid) {
      console.error("Invalid input! Try again.");
      continue;
    }

    const moved = await board.move(startPosition, endPosition);
    if (!moved) {
      console.error("Invalid move! Try again.");
      continue;
    }

    const x = board.getPieceAt("a1");
    if (x) x.position.set("a5");
  }
};

main();
