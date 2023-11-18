import { Piece, Type } from "./piece";

import { AxisValue, Position } from "../position/position";
import { getDiff, getWay } from "../position/tools";
import { isInLimit } from "../tools";

export class King extends Piece {
  move(position: Position, pieces: Piece[]) {
    const distance = this.position.chebyshevDistanceTo(position);
    if (distance === 1) {
      this.position.set(position);
    }
    if (distance === 2) {
      const { xDiff } = getDiff(this.position, position);
      const rock = this.getRockToCastle(position, pieces);
      const newRockX = position.get().x + (xDiff < 0 ? 1 : -1);
      if ((isInLimit(0, newRockX, 7), rock)) {
        this.position.set(position);
        rock.position.set({ ...position.get(), x: newRockX as AxisValue });
      }
    }
  }

  canMove(
    position: Position,
    _: any,
    willBeCheck: (piece: Piece, position: Position) => boolean,
    pieces: Piece[]
  ) {
    const distance = this.position.chebyshevDistanceTo(position);
    if (distance === 1) {
      return true;
    } else if (distance === 2) {
      const { yDiff } = getDiff(this.position, position);

      if (yDiff === 0) {
        const rockToCastle = this.getRockToCastle(position, pieces);
        if (rockToCastle) {
          const way = getWay(this.position, rockToCastle.position);
          for (const pos of way) {
            const isNotSafe = willBeCheck(this, pos);
            if (isNotSafe) {
              return false;
            }
          }

          return true;
        }
      }
    }

    return false;
  }

  private getRockToCastle(position: Position, pieces: Piece[]) {
    const { xDiff } = getDiff(this.position, position);
    const kingPoint = this.position.get();

    return pieces.find(
      (piece) =>
        piece.isAt(
          xDiff < 0 ? { x: 0, y: kingPoint.y } : { x: 7, y: kingPoint.y }
        ) && !piece.isMoved()
    );
  }

  readonly type = Type.King;
}
