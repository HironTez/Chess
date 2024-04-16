import { Piece, Type } from "./piece";

import { Position } from "../position/position";
import {
  areAlignedDiagonally,
  areAlignedHorizontally,
  areAlignedVertically,
} from "../position/tools";
import { isInLimit } from "../tools";

export class Queen extends Piece {
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
            possibleMoves.push(new Position(point));
          }
        }

        possibleMoves.push(
          new Position({ x: i, y }),
          new Position({ x, y: i }),
        );
      }
    }

    return possibleMoves;
  }

  canMove(position: Position) {
    const movingVertically = areAlignedHorizontally(this.position, position);
    const movingHorizontally = areAlignedVertically(this.position, position);
    const movingDiagonally = areAlignedDiagonally(this.position, position);
    return movingVertically || movingHorizontally || movingDiagonally;
  }

  readonly type = Type.Queen;
}
