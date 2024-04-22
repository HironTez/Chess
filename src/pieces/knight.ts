import { MutablePiece, Type } from "./piece";

import { MutablePosition, getDiff } from "../position";

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
    const { xDiff, yDiff } = getDiff(this.position, position);
    const xDiffAbs = Math.abs(xDiff);
    const yDiffAbs = Math.abs(yDiff);
    return (
      distance === 2 &&
      ((xDiffAbs === 1 && yDiffAbs === 2) || (xDiffAbs === 2 && yDiffAbs === 1))
    );
  }

  readonly type = Type.Knight;
}
