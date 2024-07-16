import { Board, Color } from "../src";
import { capitalize, input, parseMoveInput, stringifyBoard } from "./helpers";

const main = async () => {
  console.log("----------\nChess game\n----------\n");
  console.log('Input example: "a2 a4" or "undo"');

  const board = new Board({
    onCheck: (color) => {
      console.log(`${capitalize(color)} king is in check!`);
    },
    onCheckmate: (color) => {
      console.log(`${capitalize(color)} king is in checkmate!`);
    },
    onDraw: () => {
      console.log(`Draw!`);
    },
    onCheckResolve: () => {
      console.log("Check resolved");
    },
    onCheckmateResolve: () => {
      console.log("Checkmate undone");
    },
    onDrawResolve: () => {
      console.log("Draw undone");
    },
    onBoardChange: (pieces) => {
      console.log(`\n${stringifyBoard(pieces)}\n`);
    },
  });

  while (true) {
    const positionValue = await board.evaluate(2);
    console.log(
      `Positions value ${board.currentTurnColor === Color.White ? positionValue : -positionValue}`,
    );

    const moveInput = await input("Enter your move: ");
    if (moveInput === "undo") {
      board.undo();
    } else {
      const { startPosition, endPosition } = parseMoveInput(moveInput);

      if (!startPosition?.isValid || !endPosition?.isValid) {
        console.error("Invalid input! Try again.");
        continue;
      }

      const move = await board.move(startPosition, endPosition);
      if (!move.success) {
        console.error("Invalid move! Try again.");
        continue;
      }
    }
  }
};

main();
