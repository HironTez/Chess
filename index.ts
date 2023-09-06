import { Bishop, Color, King, Knight, Pawn, Queen, Rock } from "./pieces";

import { Board } from "./board";
import { arrayConstructor } from "./tools";
import { AxisValue } from "./position/position";

const board = new Board(
  [
    ...arrayConstructor(
      8,
      (i: AxisValue) => new Pawn({ x: i, y: 1 }, Color.White)
    ),
    new Rock({ x: 0, y: 0 }, Color.White),
    new Rock({ x: 7, y: 0 }, Color.White),
    new Knight({ x: 1, y: 0 }, Color.White),
    new Knight({ x: 6, y: 0 }, Color.White),
    new Bishop({ x: 2, y: 0 }, Color.White),
    new Bishop({ x: 5, y: 0 }, Color.White),
    new Queen({ x: 3, y: 0 }, Color.White),
    new King({ x: 4, y: 0 }, Color.White),

    ...arrayConstructor(
      8,
      (i: AxisValue) => new Pawn({ x: i, y: 6 }, Color.Black)
    ),
    new Rock({ x: 0, y: 5 }, Color.Black),
    new Rock({ x: 7, y: 5 }, Color.Black),
    new Knight({ x: 1, y: 5 }, Color.Black),
    new Knight({ x: 6, y: 5 }, Color.Black),
    new Bishop({ x: 2, y: 5 }, Color.Black),
    new Bishop({ x: 5, y: 5 }, Color.Black),
    new Queen({ x: 3, y: 5 }, Color.Black),
    new King({ x: 4, y: 5 }, Color.Black),
  ],
  () => {
    console.log("check");
  },
  () => {
    console.log("checkmate");
  },
  () => {
    console.log("check resolved");
  },
  (pieces) => {
    console.log(pieces);
  }
);

board.movePiece({ x: 0, y: 1 }, { x: 0, y: 2 });
board.movePiece({ x: 0, y: 2 }, { x: 0, y: 3 });

// TODO: en passant
// TODO: castling
