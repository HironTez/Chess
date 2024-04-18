import { Piece, Type } from "./piece";

import { Position } from "../position/position";

export class King extends Piece {
  getPossibleMoves() {
    const { x, y } = this.position;
    return [
      new Position({ x, y: y + 1 }),
      new Position({ x: x + 1, y: y + 1 }),
      new Position({ x: x + 1, y }),
      new Position({ x: x + 1, y: y - 1 }),
      new Position({ x, y: y - 1 }),
      new Position({ x: x - 1, y: y - 1 }),
      new Position({ x: x - 1, y }),
      new Position({ x: x - 1, y: y + 1 }),
    ];
  }

  canMove(position: Position, _: unknown, isCastlingPossible: boolean) {
    const distance = this.position.distanceTo(position);

    return distance === (isCastlingPossible ? 2 : 1);
  }

  readonly type = Type.King;
}
