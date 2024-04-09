import { Bishop, Color, King, Knight, Pawn, Queen, Rock } from "./pieces";
import { arrayConstructor, printBoard } from "./tools";

import { AxisValue } from "./position/position";
import { Board } from "./board";

const board = new Board(
  [
    // ...arrayConstructor(
    //   8,
    //   (i: AxisValue) => new Pawn({ x: i, y: 1 }, Color.White)
    // ),
    // new Rock({ x: 0, y: 0 }, Color.White),
    // new Rock({ x: 7, y: 0 }, Color.White),
    // new Knight({ x: 1, y: 0 }, Color.White),
    // new Knight({ x: 6, y: 0 }, Color.White),
    // new Bishop({ x: 2, y: 0 }, Color.White),
    // new Bishop({ x: 5, y: 0 }, Color.White),
    // new Queen({ x: 3, y: 0 }, Color.White),
    // new King({ x: 4, y: 0 }, Color.White),

    // ...arrayConstructor(
    //   8,
    //   (i: AxisValue) => new Pawn({ x: i, y: 6 }, Color.Black)
    // ),
    // new Rock({ x: 0, y: 5 }, Color.Black),
    // new Rock({ x: 7, y: 5 }, Color.Black),
    // new Knight({ x: 1, y: 5 }, Color.Black),
    // new Knight({ x: 6, y: 5 }, Color.Black),
    // new Bishop({ x: 2, y: 5 }, Color.Black),
    // new Bishop({ x: 5, y: 5 }, Color.Black),
    // new Queen({ x: 3, y: 5 }, Color.Black),
    // new King({ x: 4, y: 5 }, Color.Black),

    new King({ x: 4, y: 0 }, Color.White),
    new King({ x: 4, y: 7 }, Color.Black),

    new Pawn({ x: 0, y: 1 }, Color.White),
    new Pawn({ x: 1, y: 3 }, Color.Black),
  ],
  {
    onCheck: (king) => {
      console.log("check", king.color);
    },
    onCheckMate: (king) => {
      console.log("checkmate", king.color);
    },
    onCheckResolve: () => {
      console.log("check resolved");
    },
    onBoardChange: (pieces) => {
      printBoard(pieces);
    },
  }
);

const pawnDoubleMoveSuccess = board.movePiece({ x: 0, y: 1 }, { x: 0, y: 3 });
console.log("🚀 ~ pawnDoubleMoveSuccess:", pawnDoubleMoveSuccess);
const enPassantSuccess = board.movePiece({ x: 1, y: 3 }, { x: 0, y: 2 });
console.log("🚀 ~ enPassantSuccess:", enPassantSuccess);
