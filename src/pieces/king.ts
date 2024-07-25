import { MutablePiece, Type } from "./piece";

import { MutablePosition, areAlignedVertically } from "../position";

export class King extends MutablePiece {
  getPotentialMoves() {
    const { x, y } = this.position;
    return [
      new MutablePosition({ x, y: y + 1 }),
      new MutablePosition({ x: x + 1, y: y + 1 }),
      new MutablePosition({ x: x + 1, y }),
      new MutablePosition({ x: x + 1, y: y - 1 }),
      new MutablePosition({ x, y: y - 1 }),
      new MutablePosition({ x: x - 1, y: y - 1 }),
      new MutablePosition({ x: x - 1, y }),
      new MutablePosition({ x: x - 1, y: y + 1 }),
    ];
  }

  canMove(position: MutablePosition, _: unknown, castle: boolean) {
    const distance = this.position.distanceTo(position);
    const movingHorizontally = areAlignedVertically(this.position, position);
    const canMove = distance === 1;
    const canCastle =
      castle && !this.isMoved && movingHorizontally && distance === 2;

    return canMove || canCastle;
  }

  readonly type = Type.King;
}
