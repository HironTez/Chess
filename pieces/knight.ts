import { MutablePiece, Type } from "./piece";

import {
  MutablePosition,
  areAlignedHorizontally,
  areAlignedVertically,
} from "../position";

export class Knight extends MutablePiece {
  getPossibleMoves() {
    const { x, y } = this.position;
    return [
      new MutablePosition({ x: x + 2, y: y + 1 }),
      new MutablePosition({ x: x + 1, y: y + 2 }),
      new MutablePosition({ x: x + 2, y: y - 1 }),
      new MutablePosition({ x: x + 1, y: y - 2 }),
      new MutablePosition({ x: x - 2, y: y - 1 }),
      new MutablePosition({ x: x - 1, y: y - 2 }),
      new MutablePosition({ x: x - 2, y: y + 1 }),
      new MutablePosition({ x: x - 1, y: y + 2 }),
    ];
  }

  canMove(position: MutablePosition) {
    const distance = this.position.distanceTo(position);
    const movingVertically = areAlignedHorizontally(this.position, position);
    const movingHorizontally = areAlignedVertically(this.position, position);
    return distance === 3 && movingVertically && movingHorizontally;
  }

  readonly type = Type.Knight;
}
