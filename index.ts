import { Bishop, Color, King, Knight, Pawn, Queen, Rock } from "./pieces";

import { AxisValue } from "./position/position";
import { Board } from "./board";
import { arrayConstructor } from "./tools";

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

    new King({ x: 0, y: 7 }, Color.Black),
    new Queen({ x: 1, y: 5 }, Color.White),
    new King({ x: 2, y: 5 }, Color.White),
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
      // console.log(pieces);
    },
  }
);

board.movePiece({ x: 1, y: 5 }, { x: 1, y: 6 });

// TODO: Fix multiple checking of same moves
// TODO: en passant
// TODO: castling
