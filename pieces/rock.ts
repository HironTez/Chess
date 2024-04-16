import { areAlignedVertically } from "./../position/tools";
import { Piece, Type } from "./piece";

import { Position } from "../position/position";
import { areAlignedHorizontally } from "../position/tools";

export class Rock extends Piece {
  getPossibleMoves() {
    const possibleMoves = [];

    const { x, y } = this.position.get();
    for (let i = 0; i <= 7; i++) {
      if (i !== x) {
        possibleMoves.push(
          new Position({ x: i, y }),
          new Position({ x, y: i }),
        );
      }
    }

    return possibleMoves;
  }

  canMove(position: Position) {
    const movingVertically = areAlignedHorizontally(this.position, position);
    const movingHorizontally = areAlignedVertically(this.position, position);
    return movingVertically || movingHorizontally;
  }

  readonly type = Type.Rock;
}
