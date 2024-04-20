import { areAlignedVertically } from "../position";
import { MutablePiece, Type } from "./piece";

import { MutablePosition, areAlignedHorizontally } from "../position";

export class Rook extends MutablePiece {
  getPossibleMoves() {
    const possibleMoves = [];

    const { x, y } = this.position;
    for (let i = 0; i <= 7; i++) {
      if (i !== x) {
        possibleMoves.push(
          new MutablePosition({ x: i, y }),
          new MutablePosition({ x, y: i }),
        );
      }
    }

    return possibleMoves;
  }

  canMove(position: MutablePosition) {
    const movingVertically = areAlignedHorizontally(this.position, position);
    const movingHorizontally = areAlignedVertically(this.position, position);
    return movingVertically || movingHorizontally;
  }

  readonly type = Type.Rook;
}
