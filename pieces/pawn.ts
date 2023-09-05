import { Color, Piece, Type } from "./piece";
import {
  areAlignedDiagonally,
  areAlignedHorizontally,
  isMovingUp,
} from "../position/tools";

import { Position } from "../position/position";

export class Pawn extends Piece {
  canMove(position: Position) {
    return this.canMoveOrCapture(position, false);
  }

  canCapture(position: Position) {
    return this.canMoveOrCapture(position, true);
  }

  private canMoveOrCapture(position: Position, capture: boolean) {
    const distance = this.position.chebyshevDistanceTo(position);
    const movingVertically = areAlignedHorizontally(this.position, position);
    const movingDiagonally = areAlignedDiagonally(this.position, position);
    const movingUp = isMovingUp(this.position, position);

    return (
      distance === 1 &&
      (capture ? movingDiagonally : movingVertically) &&
      (this.color === Color.White ? movingUp : !movingUp)
    );
  }

  type = Type.Pawn;
}
