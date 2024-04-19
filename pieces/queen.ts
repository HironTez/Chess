import { MutablePiece, Type } from "./piece";

import {
  MutablePosition,
  areAlignedDiagonally,
  areAlignedHorizontally,
  areAlignedVertically,
} from "../position";
import { isInLimit } from "../tools";

export class Queen extends MutablePiece {
  getPossibleMoves() {
    const possibleMoves = [];

    const { x, y } = this.position;
    for (let i = 0; i <= 7; i++) {
      if (i !== x) {
        const diagonalPoints = [
          { x: x + i, y: y + i },
          { x: x + i, y: y - i },
          { x: x - i, y: y + i },
          { x: x - i, y: y - i },
        ];

        for (const point of diagonalPoints) {
          if (isInLimit(0, point.x, 7) && isInLimit(0, point.y, 7)) {
            possibleMoves.push(new MutablePosition(point));
          }
        }

        possibleMoves.push(
          new MutablePosition({ x: i, y }),
          new MutablePosition({ x, y: i }),
        );
      }
    }

    return possibleMoves;
  }

  canMove(position: MutablePosition) {
    const movingVertically = areAlignedHorizontally(this.position, position);
    const movingHorizontally = areAlignedVertically(this.position, position);
    const movingDiagonally = areAlignedDiagonally(this.position, position);
    return movingVertically || movingHorizontally || movingDiagonally;
  }

  readonly type = Type.Queen;
}
