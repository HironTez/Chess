import { arrayConstructor } from "../helpers";
import { Bishop, Color, King, Knight, Pawn, Queen, Rook } from "../pieces";
import { BoardOptionsT, CustomBoard } from "./board";

/**
 * Chess board with all pieces placed by default
 * @param options board options
 */

export class Board extends CustomBoard {
  constructor(options?: BoardOptionsT) {
    const pieceSet = [
      { y: 0, color: Color.White },
      { y: 7, color: Color.Black },
    ].flatMap(({ y, color }) => [
      ...arrayConstructor(8, (i) => {
        const pawnY = color === Color.White ? y + 1 : y - 1;
        return new Pawn(
          {
            x: i,
            y: pawnY,
          },
          color,
        );
      }),
      new Rook({ x: 0, y }, color),
      new Rook({ x: 7, y }, color),
      new Knight({ x: 1, y }, color),
      new Knight({ x: 6, y }, color),
      new Bishop({ x: 2, y }, color),
      new Bishop({ x: 5, y }, color),
      new Queen({ x: 3, y }, color),
      new King({ x: 4, y }, color),
    ]);

    super(pieceSet, options);
  }
}
