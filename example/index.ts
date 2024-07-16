import { Board, Color } from "../src";
import { capitalize, input, parseMoveInput, stringifyBoard } from "./helpers";

const main = async () => {
  console.log("----------\nChess game\n----------\n");
  console.log('Input example: "a2 a4" or "undo" or "auto"');

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
    onBoardChange: async () => {},
  });

  while (true) {
    console.log(`\n${stringifyBoard(board.pieces)}\n`);

    const positionValue = await board.evaluate(2);
    console.log(
      `Positions value ${board.colorToMove === Color.White ? positionValue : -positionValue}`,
    );

    const moveInput =
      board.colorToMove === Color.White || board.winnerColor
        ? await input("Enter your move: ")
        : "auto";

    if (moveInput === "undo") {
      board.undo();
    } else if (moveInput === "auto") {
      const move = await board.autoMove(3);
      if (!move.success) {
        console.error("Error while performing an auto move");
        continue;
      }

      const piece = board.getPieceAt(move.endPosition)!;
      console.log(
        `Moved ${piece.color} ${piece.type} from ${move.startPosition.notation} to ${move.endPosition.notation}`,
      );
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
