import { Board, Color, Status } from "../src";
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
    onBoardChange: (pieces) => {
      console.log(`\n${stringifyBoard(pieces)}\n`);
    },
  });

  while (true) {
    await evaluateBoard(board);

    const shouldAutoMove =
      board.colorToMove === Color.Black && board.status === Status.Active;

    const movePrompt = shouldAutoMove
      ? "auto"
      : await input("Enter your move: ");

    if (movePrompt === "undo") {
      board.undo();
    } else if (movePrompt === "auto") {
      await autoMove(board);
    } else {
      move(board, movePrompt);
    }
  }
};

const evaluateBoard = async (board: Board) => {
  const positionValue = await board.evaluate(2);
  const positionValueAbsolute =
    board.colorToMove === Color.White ? positionValue : -positionValue;
  console.log(`Positions value ${positionValueAbsolute}`);
};

const move = async (board: Board, movePrompt: string) => {
  const { startPosition, endPosition } = parseMoveInput(movePrompt);

  if (!startPosition?.isValid || !endPosition?.isValid)
    return console.error("Invalid input! Try again.");

  const move = await board.move(startPosition, endPosition);
  if (!move.success) return console.error("Invalid move! Try again.");
};

const autoMove = async (board: Board) => {
  const move = await board.autoMove(3);
  if (!move.success) {
    return console.error("Error while performing an auto move");
  }

  const piece = board.getPieceAt(move.endPosition)!;
  console.log(
    `Moved ${piece.color} ${piece.type} from ${move.startPosition.notation} to ${move.endPosition.notation}`,
  );
};

main();
