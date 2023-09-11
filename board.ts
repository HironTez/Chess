import { AxisValue, PointT, Position } from "./position/position";
import { Color, King, Piece, Type } from "./pieces";
import { cloneDeep, isInLimit } from "./tools";

import { getWay } from "./position/tools";

type CheckAction = (king: King) => void;

type PositionString = `${"a" | "b" | "c" | "d" | "e" | "f" | "g" | "h"}${
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"}`;

type PositionInput = Position | PointT | PositionString;

enum CheckStatus {
  Check = "check",
  Checkmate = "checkmate",
}

export class Board {
  constructor(
    pieces: Piece[],
    onCheck: CheckAction,
    onCheckMate: CheckAction,
    onCheckResolve: () => void,
    onBoardChange: (pieces: Piece[]) => void
  ) {
    this.pieces = pieces;
    this.onCheck = onCheck;
    this.onCheckMate = onCheckMate;
    this.onCheckResolve = onCheckResolve;
    this.onBoardChange = onBoardChange;
  }

  movePiece(startPosition: PositionInput, endPosition: PositionInput) {
    const start = this.parsePosition(startPosition);
    const end = this.parsePosition(endPosition);
    if (!start || !end) return;

    const piece = this.getPieceAt(start);
    if (
      piece &&
      piece.color === this.currentMove &&
      this.canPieceMove(piece, end)
    ) {
      this.removePiece(end);
      piece.move(end);

      this.moveEventHandler(piece);
    }
  }

  private parsePosition(position: PositionInput) {
    if (Position.isPosition(position)) {
      return position;
    } else if (typeof position === "string") {
      const x = position.charCodeAt(0) - 97;
      const y = position.charCodeAt(1) - 49;
      if (isInLimit(0, x, 8) && isInLimit(0, y, 8)) {
        return new Position({ x: x as AxisValue, y: y as AxisValue });
      } else {
        return false;
      }
    } else {
      return new Position(position);
    }
  }

  private moveEventHandler(piece: Piece) {
    this.currentMove = piece.oppositeColor;

    this.onBoardChange(this.pieces);

    const whiteKing = this.getKing(Color.White);
    const blackKing = this.getKing(Color.Black);
    if (!whiteKing || !blackKing) return;

    for (const king of [whiteKing, blackKing]) {
      const checkStatus = this.isKingInCheckOrCheckmate(king);
      const isInCheck = checkStatus === CheckStatus.Check;
      const isInCheckmate = checkStatus === CheckStatus.Checkmate;
      if (this.check !== isInCheck) {
        if (isInCheck) {
          this.check = king.color;

          this.onCheck(king);
        } else {
          this.check = false;

          this.onCheckResolve();
        }
      }
      if (this.checkmate !== isInCheckmate) {
        if (isInCheckmate) {
          this.checkmate = king.color;

          this.onCheckMate(king);
        } else {
          this.checkmate = false;
        }
      }
    }
  }

  private isMoveValid(piece: Piece, position: Position) {
    const isMoving = !!piece.position.distanceTo(position);

    if (!isMoving || this.checkmate) {
      return false;
    }

    const canMove = this.canPieceMove(piece, position);

    if (canMove && this.check) {
      const canDefendKing = this.canPieceDefendKing(piece);

      if (!canDefendKing) {
        return false;
      }
    }

    return canMove;
  }

  private canPieceMove(piece: Piece, position: Position) {
    const way = getWay(piece.position, position);

    for (const position of way) {
      if (this.getPieceAt(position)) return false;
    }

    const target = this.getPieceAt(position);
    const targetIsEnemy = target?.color === piece.oppositeColor;
    const canMove = piece.canMove(position);
    const canCapture = piece.canCapture(position);
    if (targetIsEnemy ? canCapture : canMove) {
      const willBeCheck = this.willBeCheck(piece, position);
      return !willBeCheck;
    }

    return false;
  }

  private isKingInCheckOrCheckmate(king: King) {
    const isInCheck = this.isKingInCheck(king);
    if (isInCheck) {
      const team = this.getPiecesByColor(king.color);
      for (const teammate of team) {
        if (this.canPieceDefendKing(teammate)) {
          return CheckStatus.Check;
        }
      }

      return CheckStatus.Checkmate;
    }

    return false;
  }

  private isKingInCheck(king: King) {
    return this.piecesCheckingKing(king).length > 0;
  }

  private piecesCheckingKing(king: King) {
    const enemies = this.getPiecesByColor(king.oppositeColor);
    return enemies.filter((enemy) => this.canPieceMove(enemy, king.position));
  }

  private canPieceDefendKing(piece: Piece) {
    const king = this.getKing(piece.color);
    if (!king) return false;

    const enemiesCheckingKing = this.piecesCheckingKing(king);
    for (const enemy of enemiesCheckingKing) {
      const canCaptureEnemy = this.canPieceMove(piece, enemy.position);
      if (canCaptureEnemy) {
        const willBeCheck = this.willBeCheck(piece, enemy.position);
        if (willBeCheck) {
          return false;
        }
      } else {
        return false;
      }

      const enemyWay = getWay(enemy.position, king.position);
      for (const position of enemyWay) {
        const canCover = this.isMoveValid(piece, position);
        const willCancelCheck = this.willBeCheck(piece, position);

        if (canCover && willCancelCheck) {
          return false;
        }
      }
    }

    return true;
  }

  private willBeCheck(piece: Piece, position: Position): boolean {
    const target = this.getPieceAt(position);
    const previousPosition = piece.position.get();

    piece.position.set(position);
    if (target) target.active = false;
    const king = this.getKing(piece.color);
    const isInCheck = !!king && this.isKingInCheck(king);

    piece.position.set(previousPosition);
    if (target) target.active = true;

    return isInCheck;
  }

  private getPieceAt(position: Position) {
    return this.pieces.find((piece) => piece.isAt(position) && piece.active);
  }

  private getPiecesByColor(color: Color) {
    return this.pieces.filter((piece) => piece.color === color && piece.active);
  }

  private getKing(color: Color) {
    return this.pieces.find(
      (piece) =>
        piece.type === Type.King && piece.color === color && piece.active
    ) as King | undefined;
  }

  private removePiece(position: Position) {
    this.pieces = this.pieces.filter((piece) => !piece.isAt(position));
  }

  private check: Color | false = false;
  private checkmate: Color | false = false;
  private pieces: Array<Piece>;
  private currentMove: Color = Color.White;

  private onCheck: CheckAction;
  private onCheckMate: CheckAction;
  private onCheckResolve: () => void;
  private onBoardChange: (pieces: Array<Piece>) => void;
}
