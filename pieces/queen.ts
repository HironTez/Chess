import { Piece, Type } from "./piece";

import { Position } from "../position/position";
import {
  areAlignedDiagonally,
  areAlignedHorizontally,
  areAlignedVertically,
} from "../position/tools";

export class Queen extends Piece {
  canMove(position: Position) {
    const movingVertically = areAlignedHorizontally(this.position, position);
    const movingHorizontally = areAlignedVertically(this.position, position);
    const movingDiagonally = areAlignedDiagonally(this.position, position);
    return movingVertically || movingHorizontally || movingDiagonally;
  }

  type = Type.Queen;
}
