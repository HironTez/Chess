import { areAlignedHorizontally, isMovingUp } from "../position";
import { Color, MutablePiece, Type } from "./piece";

import { MutablePosition } from "../position";

export class Pawn extends MutablePiece {
  getPotentialMoves() {
    const { x, y } = this.position;
    const possibleMoves: MutablePosition[] = [];

    for (let newX = x - 1; newX <= x + 1; newX++) {
      possibleMoves.push(
        new MutablePosition({
          x: newX,
          y: y + (this.color === Color.White ? 1 : -1),
        }),
      );
    }

    if (!this.isMoved) {
      possibleMoves.push(
        new MutablePosition({
          x,
          y: y + (this.color === Color.White ? 2 : -2),
        }),
      );
    }

    return possibleMoves;
  }

  isJustDoubleMoved() {
    return this.justDoubleMoved;
  }

  canMove(position: MutablePosition, capture: boolean) {
    const distance = this.position.distanceTo(position);
    const movingVertically = areAlignedHorizontally(this.position, position);
    const isDirectionRight = this.isDirectionRight(position);
    const canMove = distance === 1;
    const canDoubleMove = movingVertically && !this.isMoved && distance === 2;
    const isDistanceRight = canMove || canDoubleMove;
    const isActionRight = movingVertically !== capture;

    return isDirectionRight && isDistanceRight && isActionRight;
  }

  protected onMove(position: MutablePosition) {
    if (!this.isMoved) {
      const distance = this.position.distanceTo(position);
      if (distance === 2) {
        this.justDoubleMoved = true;
        return;
      }
    }

    this.justDoubleMoved = false;
  }

  private isDirectionRight(position: MutablePosition) {
    const movingUp = isMovingUp(this.position, position);
    return this.color === Color.White ? movingUp : !movingUp;
  }

  private justDoubleMoved = false;
  readonly type = Type.Pawn;
}
