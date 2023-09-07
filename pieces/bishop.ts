import { Piece, Type } from "./piece";

import { Position } from "../position/position";
import { areAlignedDiagonally } from "../position/tools";

export class Bishop extends Piece {
  canMove(position: Position) {
    const movingDiagonally = areAlignedDiagonally(this.position, position);
    return movingDiagonally;
  }

  type = Type.Bishop;
}
