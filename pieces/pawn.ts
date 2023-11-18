import { Color, Piece, Type } from "./piece";
import {
  areAlignedDiagonally,
  areAlignedHorizontally,
  getDiff,
  isMovingUp,
} from "../position/tools";

import { Position } from "../position/position";

export class Pawn extends Piece {
  isMoveValid(
    position: Position,
    lastMoved: Piece | null,
    _: any,
    pieces: Piece[]
  ) {
    const target = pieces.find((piece) => piece.isAt(position));

    const canMove = this.canMove(position);
    const canCapture = this.canCapture(position, lastMoved, target);

    return canCapture || (!target && canMove);
  }

  isJustDoubleMoved() {
    return this.justDoubleMoved;
  }

  protected canMove(position: Position) {
    const distance = this.position.chebyshevDistanceTo(position);
    const movingVertically = areAlignedHorizontally(this.position, position);
    const directionIsRight = this.directionIsRight(position);
    const distanceIsRight = distance === 1 || (distance === 2 && !this.moved);

    return movingVertically && directionIsRight && distanceIsRight;
  }

  protected canCapture(
    position: Position,
    lastMoved: Piece | null,
    target: Piece | undefined
  ) {
    const distance = this.position.chebyshevDistanceTo(position);
    const distanceIsRight = distance === 1;
    const movingDiagonally = areAlignedDiagonally(this.position, position);
    const directionIsRight = this.directionIsRight(position);
    const targetIsEnemy = target?.color === this.oppositeColor;
    const canCaptureEnemy = target
      ? targetIsEnemy
      : lastMoved instanceof Pawn
      ? lastMoved.isJustDoubleMoved() &&
        lastMoved.position.distanceTo(this.position) === 1 &&
        lastMoved.position.get().y === this.position.get().y
      : false;

    return (
      movingDiagonally && directionIsRight && distanceIsRight && canCaptureEnemy
    );
  }

  protected onMove(position: Position) {
    if (!this.moved) {
      const distance = this.position.distanceTo(position);
      if (distance === 2) {
        this.justDoubleMoved = true;
        return;
      }
    }

    this.justDoubleMoved = false;
  }

  private directionIsRight(position: Position) {
    const movingUp = isMovingUp(this.position, position);
    return this.color === Color.White ? movingUp : !movingUp;
  }

  private justDoubleMoved = false;
  readonly type = Type.Pawn;
}
