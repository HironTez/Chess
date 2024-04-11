import { Piece, Type } from "./piece";

import { Position } from "../position/position";

export class King extends Piece {
  // if (distance === 2) {
  //   const { xDiff } = getDiff(this.position, position);
  //   const rock = this.getRockToCastle(position, pieces);
  //   const newRockX = position.get().x + (xDiff < 0 ? 1 : -1);
  //   if ((isInLimit(0, newRockX, 7), rock)) {
  //     this.position.set(position);
  //     rock.position.set({ ...position.get(), x: newRockX as AxisValue });
  //   }
  // }

  canMove(position: Position, _: unknown, isCastlingPossible: boolean) {
    const distance = this.position.chebyshevDistanceTo(position);

    return distance === (isCastlingPossible ? 2 : 1);
  }

  // private getRockToCastle(position: Position) {
  //   const { xDiff } = getDiff(this.position, position);
  //   const kingPoint = this.position.get();

  //   return pieces.find(
  //     (piece) =>
  //       piece.isAt(
  //         xDiff < 0 ? { x: 0, y: kingPoint.y } : { x: 7, y: kingPoint.y }
  //       ) && !piece.isMoved()
  //   );
  // }

  readonly type = Type.King;
}
