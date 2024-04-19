import { Piece, Type } from "./piece";

import { Position, areAlignedDiagonally } from "../position";
import { isInLimit } from "../tools";

export class Bishop extends Piece {
  getPossibleMoves() {
    const possibleMoves = [];

    const { x, y } = this.position;
    for (let i = 0; i <= 7; i++) {
      if (i !== x) {
        const points = [
          { x: x + i, y: y + i },
          { x: x + i, y: y - i },
          { x: x - i, y: y + i },
          { x: x - i, y: y - i },
        ];

        for (const point of points) {
          if (isInLimit(0, point.x, 7) && isInLimit(0, point.y, 7)) {
            possibleMoves.push(new Position(point));
          }
        }
      }
    }

    return possibleMoves;
  }

  canMove(position: Position) {
    const movingDiagonally = areAlignedDiagonally(this.position, position);
    return movingDiagonally;
  }

  readonly type = Type.Bishop;
}
