import { input, printBoard } from "./tools";

import { PreparedBoard } from "./board/preparedBoard";
import { Position, PositionString } from "./position/position";

const board = new PreparedBoard({
  onCheck: (king) => {
    console.log(`${king.color} king is in check!`.toLocaleUpperCase());
  },
  onCheckMate: (king) => {
    console.log(`${king.color} king is in checkmate!`.toLocaleUpperCase());
  },
  onCheckResolve: () => {
    console.log("Check resolved");
  },
  onBoardChange: (pieces) => {
    printBoard(pieces);
  },
});

const main = async () => {
  while (true) {
    const moveInput = await input("Enter your move (example: a2 - a4): ");
    const positions = moveInput.match(/([a-hA-H][1-8]).*([a-hA-H][1-8])/);
    const startPositionParsed = positions?.at(1) as PositionString | undefined;
    const endPositionParsed = positions?.at(2) as PositionString | undefined;
    const startPosition =
      startPositionParsed && Position.parsePosition(startPositionParsed);
    const endPosition =
      endPositionParsed && Position.parsePosition(endPositionParsed);

    if (!startPosition || !endPosition) {
      console.error("Invalid input! Try again.");
      continue;
    }

    const moved = board.move(startPosition, endPosition);
    if (!moved) {
      console.error("Invalid move! Try again.");
      continue;
    }
  }
};

main();

// TODO: pawn promotion variants
