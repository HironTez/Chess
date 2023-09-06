import { Bishop, Color, King, Knight, Pawn, Queen, Rock } from "./pieces";

import { Board } from "./board";
import { Position } from "./position/position";
import { arrayConstructor } from "./tools";

const board = new Board(
  [
    ...arrayConstructor(
      8,
      (i) => new Pawn(new Position({ x: i, y: 1 }), Color.White)
    ),
    new Rock(new Position({ x: 0, y: 0 }), Color.White),
    new Rock(new Position({ x: 7, y: 0 }), Color.White),
    new Knight(new Position({ x: 1, y: 0 }), Color.White),
    new Knight(new Position({ x: 6, y: 0 }), Color.White),
    new Bishop(new Position({ x: 2, y: 0 }), Color.White),
    new Bishop(new Position({ x: 5, y: 0 }), Color.White),
    new Queen(new Position({ x: 3, y: 0 }), Color.White),
    new King(new Position({ x: 4, y: 0 }), Color.White),

    ...arrayConstructor(
      8,
      (i) => new Pawn(new Position({ x: i, y: 6 }), Color.Black)
    ),
    new Rock(new Position({ x: 0, y: 5 }), Color.Black),
    new Rock(new Position({ x: 7, y: 5 }), Color.Black),
    new Knight(new Position({ x: 1, y: 5 }), Color.Black),
    new Knight(new Position({ x: 6, y: 5 }), Color.Black),
    new Bishop(new Position({ x: 2, y: 5 }), Color.Black),
    new Bishop(new Position({ x: 5, y: 5 }), Color.Black),
    new Queen(new Position({ x: 3, y: 5 }), Color.Black),
    new King(new Position({ x: 4, y: 5 }), Color.Black),
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

board.movePiece(new Position({ x: 0, y: 1 }), new Position({ x: 0, y: 2 }));

// TODO: en passant
// TODO: castling
