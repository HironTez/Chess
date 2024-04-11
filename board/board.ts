import { AxisValue, Position, PositionInput } from "../position/position";
import { Color, King, Pawn, Piece, Queen, Rock, Type } from "../pieces";

import { getDiff, getSurroundingPositions, getWay } from "../position/tools";

type CheckAction = (king: King) => void;

enum CheckStatus {
  Check = "check",
  Checkmate = "checkmate",
}

export type BoardOptionsT = {
  onCheck?: CheckAction;
  onCheckMate?: CheckAction;
  onCheckResolve?: () => void;
  onBoardChange?: (pieces: Piece[]) => void;
};

export class Board {
  constructor(pieces: Piece[], options?: BoardOptionsT) {
    this.pieces = pieces;
    this.onCheck = options?.onCheck;
    this.onCheckMate = options?.onCheckMate;
    this.onCheckResolve = options?.onCheckResolve;
    this.onBoardChange = options?.onBoardChange;

    this.onBoardChange?.(this.pieces);
  }

  getCheck() {
    return this.check;
  }

  getCheckmate() {
    return this.checkmate;
  }

  getPieces() {
    return this.pieces;
  }

  getPieceAt(positionInput: PositionInput) {
    const position = Position.parsePosition(positionInput);
    if (!position) return null;

    return (
      this.pieces.find((piece) => piece.isAt(position) && piece.active) ?? null
    );
  }

  getPiecesByColor(color: Color) {
    return this.pieces.filter((piece) => piece.color === color && piece.active);
  }

  getKing(color: Color) {
    return this.pieces.find(
      (piece) =>
        piece.type === Type.King && piece.color === color && piece.active
    ) as King | undefined;
  }

  move(startPositionInput: PositionInput, endPositionInput: PositionInput) {
    const startPosition = Position.parsePosition(startPositionInput);
    const endPosition = Position.parsePosition(endPositionInput);
    if (!startPosition || !endPosition) return false;

    return this.movePiece(startPosition, endPosition);
  }

  private movePiece(startPosition: Position, endPosition: Position) {
    const piece = this.getPieceAt(startPosition);
    if (!piece) return false;

    const { rock: castlingRock, newPosition: newRockPosition } =
      this.getCastlingRock(piece, endPosition);

    const isMoveValid = this.isMoveValid(
      piece,
      endPosition,
      castlingRock?.position
    );
    if (isMoveValid) {
      const enemyPosition =
        piece instanceof Pawn
          ? this.isEnPassantPossible(startPosition)
            ? this.lastMoved!.position
            : endPosition
          : endPosition;

      this.removePieceAt(enemyPosition);
      piece.move(endPosition);

      if (this.isPromotionPossible(piece)) {
        this.removePieceAt(piece.position);
        this.pieces.push(new Queen(piece.position, piece.color));
      }

      if (castlingRock) {
        castlingRock.move(newRockPosition);
      }

      this.moveEventHandler(piece);

      return true;
    }

    return false;
  }

  private isEnPassantPossible(position: Position) {
    const target = this.lastMoved;
    if (!(target instanceof Pawn)) return false;

    const isTargetJustMoved = target.isJustDoubleMoved();
    const isTargetOneSquareAway = target.position.distanceTo(position) === 1;
    const targetOnSide = target.position.get().y === position.get().y;

    return isTargetJustMoved && isTargetOneSquareAway && targetOnSide;
  }

  private isPromotionPossible(piece: Piece) {
    if (piece instanceof Pawn) {
      if (
        (piece.color === Color.White && piece.position.get().y === 7) ||
        (piece.color === Color.Black && piece.position.get().y === 0)
      ) {
        return true;
      }
    }

    return false;
  }

  private getCastlingRock(piece: Piece, position: Position) {
    if (piece instanceof King) {
      if (!piece.isMoved()) {
        const { xDiff, yDiff } = getDiff(piece.position, position);
        if (Math.abs(xDiff) === 2 && !yDiff) {
          const { x, y } = position.get();
          const rockPosX = x < 4 ? 0 : 7;
          const newRockPosX = x < 4 ? 3 : 5;
          const rock = this.getPieceAt({ x: rockPosX, y });
          if (rock instanceof Rock) {
            const rockIsMoved = rock?.isMoved();
            return {
              rock: rockIsMoved ? null : rock,
              newPosition: new Position({ x: newRockPosX, y }),
            };
          }
        }
      }
    }

    return {};
  }

  private moveEventHandler(piece: Piece) {
    this.currentMove = piece.oppositeColor;
    this.lastMoved = piece;

    this.onBoardChange?.(this.pieces);

    const whiteKing = this.getKing(Color.White);
    const blackKing = this.getKing(Color.Black);
    if (!whiteKing || !blackKing) return;

    for (const king of [whiteKing, blackKing]) {
      const checkStatus = this.getCheckStatus(king);
      const isInCheck = checkStatus === CheckStatus.Check;
      const isInCheckmate = checkStatus === CheckStatus.Checkmate;
      if (this.check !== isInCheck) {
        if (isInCheck) {
          this.check = king.color;

          this.onCheck?.(king);
        } else {
          this.check = false;

          this.onCheckResolve?.();
        }
      }
      if (this.checkmate !== isInCheckmate) {
        if (isInCheckmate) {
          this.checkmate = king.color;

          this.onCheckMate?.(king);
        } else {
          this.checkmate = false;
        }
      }
    }
  }

  private isMoveValid(
    piece: Piece,
    position: Position,
    castlingRockPosition?: Position
  ) {
    if (this.checkmate || this.check) return false;

    const isTurnRight = piece.color === this.currentMove;
    if (!isTurnRight) return false;

    const isMoving = !!piece.position.distanceTo(position);
    if (!isMoving) return false;

    const canMove = this.canPieceMove(piece, position, castlingRockPosition);
    return canMove;
  }

  private canPieceMove(
    piece: Piece,
    position: Position,
    castlingRockPosition?: Position
  ) {
    const { xDiff } = getDiff(piece.position, position);
    const way = getWay(
      piece.position,
      castlingRockPosition && Math.abs(xDiff) === 2
        ? castlingRockPosition
        : position
    );

    for (const pos of way) {
      const pieceOnWay = this.getPieceAt(pos);
      if (pieceOnWay) return false;
    }

    const target = this.getPieceAt(position);
    const targetIsEnemy = target?.color === piece.oppositeColor;
    if (targetIsEnemy || !target) {
      const canMove = piece.isMoveValid(
        position,
        target,
        this.lastMoved,
        !!castlingRockPosition
      );
      if (canMove) {
        const willBeCheck = this.willBeCheck(piece, position);

        if (castlingRockPosition) {
          for (const pos of way) {
            const isPosOnCheck = this.willBeCheck(piece, pos);
            if (isPosOnCheck) return false;
          }
        }

        return !willBeCheck;
      }
    }

    return false;
  }

  private getCheckStatus(king: King) {
    const isInCheck = this.isKingInCheck(king);
    if (isInCheck) {
      const team = this.getPiecesByColor(king.color);
      for (const teammate of team) {
        if (teammate === king) continue;

        const canDefendKing = this.canPieceDefendKing(teammate);
        if (canDefendKing) {
          return CheckStatus.Check;
        }
      }

      const surroundingPositions = getSurroundingPositions(king.position);
      for (const position of surroundingPositions) {
        const canEscape = this.canPieceMove(king, position);
        if (canEscape) {
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
        const canCover = this.canPieceMove(piece, position);
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

  private removePieceAt(position: Position) {
    this.pieces = this.pieces.filter((piece) => !piece.isAt(position));
  }

  private check: Color | false = false;
  private checkmate: Color | false = false;
  private pieces: Array<Piece>;
  private currentMove: Color = Color.White;
  private lastMoved: Piece | null = null;

  private onCheck: CheckAction | undefined;
  private onCheckMate: CheckAction | undefined;
  private onCheckResolve: (() => void) | undefined;
  private onBoardChange: ((pieces: Array<Piece>) => void) | undefined;
}
