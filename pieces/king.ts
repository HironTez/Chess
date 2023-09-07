import { Piece, Type } from "./piece";

import { Position } from "../position/position";

export class King extends Piece {
  canMove(position: Position) {
    const distance = this.position.chebyshevDistanceTo(position);
    return distance === 1;
  }

  type = Type.King;
}
