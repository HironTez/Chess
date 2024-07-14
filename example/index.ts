import { Board } from "../src";
import { capitalize, input, parseMoveInput, stringifyBoard } from "./helpers";

const main = async () => {
  console.log("----------\nChess game\n----------\n");
  console.log('Input example: "a2 a4"');

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
    onDraw: () => {
      console.log(`Draw!`);
    },
    onBoardChange: (pieces) => {
      console.log(`\n${stringifyBoard(pieces)}\n`);
    },
  });

  while (true) {
    const moveInput = await input("Enter your move: ");
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
