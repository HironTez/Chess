import { Board } from "../src";
import { capitalize, input, parseMoveInput, printBoard } from "./helpers";

const board = new Board({
  onCheck: (color) => {
    console.log(`${capitalize(color)} king is in check!`);
  },
  onCheckMate: (color) => {
    console.log(`${capitalize(color)} king is in checkmate!`);
  },
  onCheckResolve: () => {
    console.log("Check resolved");
  },
  onStalemate: (color) => {
    console.log(`${capitalize(color)} king is in stalemate!`);
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
