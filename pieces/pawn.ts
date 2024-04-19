import {
  areAlignedDiagonally,
  areAlignedHorizontally,
  isMovingUp,
} from "../position";
import { Color, Piece, Type } from "./piece";

import { Position } from "../position";

export class Pawn extends Piece {
  isMoveValid(
    position: Position,
    target: Piece | null,
    lastMoved: Piece | null,
  ) {
    const canMove = this.canMove(position);
    const canCapture = this.canCapture(position, lastMoved, target);

    return canCapture || (!target && canMove);
  }

  getPossibleMoves() {
    const { x, y } = this.position;
    const possibleMoves = [];

    for (let newX = x - 1; newX <= x + 1; newX++) {
      possibleMoves.push(
        new Position({
          x: newX,
          y: y + (this.color === Color.White ? 1 : -1),
        }),
      );
    }

    if (!this.isMoved) {
      possibleMoves.push(
        new Position({
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

  canMove(position: Position) {
    const distance = this.position.distanceTo(position);
    const movingVertically = areAlignedHorizontally(this.position, position);
    const directionIsRight = this.directionIsRight(position);
    const distanceIsRight = distance === 1 || (distance === 2 && !this.isMoved);

    return movingVertically && directionIsRight && distanceIsRight;
  }

  canCapture(
    position: Position,
    lastMoved: Piece | null,
    target: Piece | null,
  ) {
    const distance = this.position.distanceTo(position);
    const distanceIsRight = distance === 1;
    const movingDiagonally = areAlignedDiagonally(this.position, position);
    const directionIsRight = this.directionIsRight(position);
    const targetIsEnemy = target?.color === this.oppositeColor;

    const canCaptureEnemy =
      targetIsEnemy ||
      (lastMoved instanceof Pawn
        ? lastMoved.isJustDoubleMoved() &&
          lastMoved.position.distanceTo(this.position) === 1 &&
          lastMoved.position.y === this.position.y
        : false);

    return (
      movingDiagonally && directionIsRight && distanceIsRight && canCaptureEnemy
    );
  }

  protected onMove(position: Position) {
    if (!this.isMoved) {
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
