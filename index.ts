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
  onStalemate: (king) => {
    console.log(`${king.color} king is in stalemate!`.toLocaleUpperCase());
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
      startPositionParsed && new Position(startPositionParsed);
    const endPosition = endPositionParsed && new Position(endPositionParsed);

    if (!startPosition?.isValid() || !endPosition?.isValid()) {
      console.error("Invalid input! Try again.");
      continue;
    }

    const moved = board.move(startPosition, endPosition);
    if (!moved) {
      console.error("Invalid move! Try again.");
      continue;
    }

    const x = board._getPieceAt("a1");
    if (x) x.position.set("a5");
  }
};

main();

// TODO: Stalemate
// TODO: pawn promotion variants
// TODO: get possible moves of piece
