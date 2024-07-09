import { MutablePiece, Type } from "./piece";

import { isInLimit } from "../helpers";
import { MutablePosition, areAlignedDiagonally } from "../position";

export class Bishop extends MutablePiece {
  getPossibleMoves() {
    const possibleMoves: MutablePosition[] = [];

    const { x, y } = this.position;
    for (let i = 0; i <= 7; i++) {
      const points = [
        { x: x + i, y: y + i },
        { x: x + i, y: y - i },
        { x: x - i, y: y + i },
        { x: x - i, y: y - i },
      ];

      for (const point of points) {
        if (isInLimit(0, point.x, 7) && isInLimit(0, point.y, 7)) {
          possibleMoves.push(new MutablePosition(point));
        }
      }
    }

    return possibleMoves;
  }

  canMove(position: MutablePosition) {
    const movingDiagonally = areAlignedDiagonally(this.position, position);
    return movingDiagonally;
  }

  readonly type = Type.Bishop;
}
