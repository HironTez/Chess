import { input, parseMoveInput, printBoard } from "./tools";

import { Board } from "./";

const board = new Board({
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
