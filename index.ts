import { Bishop, Color, King, Knight, Pawn, Queen, Rock } from "./pieces";
import { arrayConstructor, input, printBoard } from "./tools";

import { AxisValue, Position, PositionString } from "./position/position";
import { Board } from "./board";

const board = new Board(
  [
    ...arrayConstructor(
      8,
      (i) => new Pawn({ x: i as AxisValue, y: 1 }, Color.White)
    ),
    new Rock("A1", Color.White),
    new Rock("H1", Color.White),
    new Knight("B1", Color.White),
    new Knight("G1", Color.White),
    new Bishop("C1", Color.White),
    new Bishop("F1", Color.White),
    new Queen("D1", Color.White),
    new King("E1", Color.White),

    ...arrayConstructor(
      8,
      (i) => new Pawn({ x: i as AxisValue, y: 6 }, Color.Black)
    ),
    new Rock("A8", Color.Black),
    new Rock("H8", Color.Black),
    new Knight("B8", Color.Black),
    new Knight("G8", Color.Black),
    new Bishop("C8", Color.Black),
    new Bishop("F8", Color.Black),
    new Queen("D8", Color.Black),
    new King("E8", Color.Black),
  ],
  {
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
  }
);

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
