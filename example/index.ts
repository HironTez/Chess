import { Board, Color } from "../src";
import { capitalize, input, parseMoveInput, stringifyBoard } from "./helpers";

const main = async () => {
  console.log("----------\nChess game\n----------\n");
  console.log('Input example: "a2 a4" or "undo" or "auto" or "evaluate"');

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
    const shouldAutoMove =
      board.colorToMove === Color.Black && !board.winnerColor;

    const movePrompt = shouldAutoMove
      ? "auto"
      : await input("Enter your move: ");

    if (movePrompt === "evaluate") {
      await evaluateBoard(board);
    } else if (movePrompt === "undo") {
      undo(board);
    } else if (movePrompt === "auto") {
      await autoMove(board);
    } else {
      await move(board, movePrompt);
    }
  }
};

const evaluateBoard = async (board: Board) => {
  const positionValue = await board.evaluate(3);
  const positionValueAbsolute =
    board.colorToMove === Color.White ? positionValue : -positionValue;
  console.log(`Positions value ${positionValueAbsolute}`);
};

const move = async (board: Board, movePrompt: string) => {
  const { startPosition, endPosition } = parseMoveInput(movePrompt);

  if (!startPosition?.isValid || !endPosition?.isValid)
    return console.error("Invalid input! Try again.");

  const move = await board.move(startPosition, endPosition);
  if (!move.success)
    return console.error(`Invalid move! Try again. Reason: ${move.reason}`);
};

const autoMove = async (board: Board) => {
  const move = await board.autoMove(3);
  if (!move.success) {
    return console.error(
      `Error while performing an auto move. Reason: ${move.reason}`,
    );
  }

  const piece = board.getPieceAt(move.endPosition)!;
  console.log(
    `Moved ${piece.color} ${piece.type} from ${move.startPosition.notation} to ${move.endPosition.notation}`,
  );
};

const undo = (board: Board) => {
  const undoBlack = board.undo();
  const undoWhite = board.undo();

  let errorReason;
  if (!undoBlack.success) errorReason = undoBlack.reason;
  if (!undoWhite.success) errorReason = undoWhite.reason;
  if (!undoBlack.success || !undoWhite.success) {
    return console.error(`Error while undoing. Reason: ${errorReason}`);
  }
};

main();
