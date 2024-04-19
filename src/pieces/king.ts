import { MutablePiece, Type } from "./piece";

import { MutablePosition } from "../position";

export class King extends MutablePiece {
  getPossibleMoves() {
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

  canMove(position: MutablePosition, _: unknown, isCastlingPossible: boolean) {
    const distance = this.position.distanceTo(position);

    return distance === (isCastlingPossible ? 2 : 1);
  }

  readonly type = Type.King;
}
