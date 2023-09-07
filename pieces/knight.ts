import { Piece, Type } from "./piece";

import { Position } from "../position/position";
import {
  areAlignedHorizontally,
  areAlignedVertically,
} from "../position/tools";

export class Knight extends Piece {
  canMove(position: Position) {
    const distance = this.position.distanceTo(position);
    const movingVertically = areAlignedHorizontally(this.position, position);
    const movingHorizontally = areAlignedVertically(this.position, position);
    return distance === 3 && movingVertically && movingHorizontally;
  }

  type = Type.Knight;
}
