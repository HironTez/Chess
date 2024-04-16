import { Piece, Type } from "./piece";

import { Position } from "../position/position";
import {
  areAlignedHorizontally,
  areAlignedVertically,
} from "../position/tools";

export class Knight extends Piece {
  getPossibleMoves() {
    const { x, y } = this.position;
    return [
      new Position({ x: x + 2, y: y + 1 }),
      new Position({ x: x + 1, y: y + 2 }),
      new Position({ x: x + 2, y: y - 1 }),
      new Position({ x: x + 1, y: y - 2 }),
      new Position({ x: x - 2, y: y - 1 }),
      new Position({ x: x - 1, y: y - 2 }),
      new Position({ x: x - 2, y: y + 1 }),
      new Position({ x: x - 1, y: y + 2 }),
    ];
  }

  canMove(position: Position) {
    const distance = this.position.distanceTo(position);
    const movingVertically = areAlignedHorizontally(this.position, position);
    const movingHorizontally = areAlignedVertically(this.position, position);
    return distance === 3 && movingVertically && movingHorizontally;
  }

  readonly type = Type.Knight;
}
