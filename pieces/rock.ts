import { areAlignedVertically } from "./../position/tools";
import { Piece, Type } from "./piece";

import { Position } from "../position/position";
import { areAlignedHorizontally } from "../position/tools";

export class Rock extends Piece {
  canMove(position: Position) {
    const movingVertically = areAlignedHorizontally(this.position, position);
    const movingHorizontally = areAlignedVertically(this.position, position);
    return movingVertically || movingHorizontally;
  }

  readonly type = Type.Rock;
}
