import { Color, King, Pawn, Piece, Queen, Rock, Type } from "../pieces";
import { Position, PositionInput } from "../position/position";

import { getDiff, getSurroundingPositions, getWay } from "../position/tools";
import { isInLimit } from "../tools";

type CheckAction = (king: King) => void;

enum CheckStatus {
  Check = "check",
  Checkmate = "checkmate",
  Stalemate = "stalemate",
}

export type BoardOptionsT = {
  onCheck?: CheckAction;
  onCheckMate?: CheckAction;
  onCheckResolve?: () => void;
  onStalemate?: CheckAction;
  onBoardChange?: (pieces: Piece[]) => void;
};

export class Board {
  constructor(pieces: Piece[], options?: BoardOptionsT) {
    this._pieces = pieces;
    this.onCheck = options?.onCheck;
    this.onCheckMate = options?.onCheckMate;
    this.onCheckResolve = options?.onCheckResolve;
    this.onStalemate = options?.onStalemate;
    this.onBoardChange = options?.onBoardChange;

    this.onBoardChange?.(this._pieces);
  }

  get check() {
    return this._check;
  }
  get checkmate() {
    return this._checkmate;
  }
  get stalemate() {
    return this._stalemate;
  }
  get pieces() {
    return this._pieces;
  }
  get currentMove() {
    return this._currentMove;
  }
  get lastMovedPiece() {
    return this._lastMovedPiece;
  }

  getPieceAt(positionInput: PositionInput) {
    const position = new Position(positionInput);
    if (!position) return undefined;

    return this._pieces.find((piece) => piece.isAt(position));
  }

  getPiecesByColor(color: Color) {
    return this._pieces.filter((piece) => piece.color === color);
  }

  getKing(color: Color) {
    return this._pieces.find(
      (piece) => piece.type === Type.King && piece.color === color,
    ) as King | undefined;
  }

  move(startPositionInput: PositionInput, endPositionInput: PositionInput) {
    const startPosition = new Position(startPositionInput);
    const endPosition = new Position(endPositionInput);
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
      castlingRock?.position,
    );
    if (isMoveValid) {
      const enemyPosition =
        piece instanceof Pawn
          ? this.isEnPassantPossible(startPosition)
            ? this._lastMovedPiece!.position
            : endPosition
          : endPosition;

      this.removePieceAt(enemyPosition);
      piece.move(endPosition);

      if (this.isPromotionPossible(piece)) {
        this.removePieceAt(piece.position);
        this._pieces.push(new Queen(piece.position, piece.color));
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
    const target = this._lastMovedPiece;
    if (!(target instanceof Pawn)) return false;

    const isTargetJustMoved = target.isJustDoubleMoved();
    const isTargetOneSquareAway = target.position.distanceTo(position) === 1;
    const targetOnSide = target.position.y === position.y;

    return isTargetJustMoved && isTargetOneSquareAway && targetOnSide;
  }

  private isPromotionPossible(piece: Piece) {
    if (piece instanceof Pawn) {
      if (
        (piece.color === Color.White && piece.position.y === 7) ||
        (piece.color === Color.Black && piece.position.y === 0)
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
          const { x, y } = position;
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
    this._currentMove = piece.oppositeColor;
    this._lastMovedPiece = piece;

    this.onBoardChange?.(this._pieces);

    const king = this.getKing(this._currentMove);
    if (!king) return;

    const checkStatus = this.getCheckStatus(king);
    const isInCheck = checkStatus === CheckStatus.Check;
    const isInCheckmate = checkStatus === CheckStatus.Checkmate;
    const isInStalemate = checkStatus === CheckStatus.Stalemate;
    if (this._check !== king.oppositeColor && !!this._check !== isInCheck) {
      if (isInCheck) {
        this._check = king.color;

        this.onCheck?.(king);
      } else {
        this._check = undefined;

        this.onCheckResolve?.();
      }
    }
    if (
      this._checkmate !== king.oppositeColor &&
      !!this._checkmate !== isInCheckmate
    ) {
      if (isInCheckmate) {
        this._check = king.color;
        this._checkmate = king.color;

        this.onCheckMate?.(king);
      } else {
        this._checkmate = undefined;
      }
    }
    if (
      this._stalemate !== king.oppositeColor &&
      !!this._stalemate !== isInStalemate
    ) {
      if (isInStalemate) {
        this._stalemate = king.color;

        this.onStalemate?.(king);
      } else {
        this._stalemate = undefined;
      }
    }
  }

  private isMoveValid(
    piece: Piece,
    position: Position,
    castlingRockPosition?: Position,
  ) {
    if (this._checkmate || this._check) return false;

    const isTurnRight = piece.color === this._currentMove;
    if (!isTurnRight) return false;

    const isMoving = !!piece.position.distanceTo(position);
    if (!isMoving) return false;

    if (!isInLimit(0, position.x, 7) || !isInLimit(0, position.y, 7))
      return false;

    const canMove = this.canPieceMove(piece, position, castlingRockPosition);
    return canMove;
  }

  private canPieceMove(
    piece: Piece,
    position: Position,
    castlingRockPosition?: Position,
  ) {
    const { xDiff } = getDiff(piece.position, position);
    const way = getWay(
      piece.position,
      castlingRockPosition && Math.abs(xDiff) === 2
        ? castlingRockPosition
        : position,
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
        target ?? null,
        this._lastMovedPiece,
        !!castlingRockPosition,
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
    const isInCheck = this.isKingInCheck(king, undefined);
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

    const teamPieces = this.getPiecesByColor(king.color);
    if (teamPieces.length > 0) {
      for (const piece of teamPieces) {
        const possibleMoves = this.getPossibleMoves(piece);
        if (possibleMoves.length > 0) {
          return undefined;
        }
      }

      return CheckStatus.Stalemate;
    }

    return undefined;
  }

  private isKingInCheck(king: King, ignorePiece: Piece | undefined) {
    return this.piecesCheckingKing(king, ignorePiece).length > 0;
  }

  private piecesCheckingKing(king: King, ignorePiece: Piece | undefined) {
    const enemies = this.getPiecesByColor(king.oppositeColor);
    return enemies.filter(
      (enemy) =>
        this.canPieceMove(enemy, king.position) && enemy !== ignorePiece,
    );
  }

  private canPieceDefendKing(piece: Piece) {
    const king = this.getKing(piece.color);
    if (!king) return false;

    const enemiesCheckingKing = this.piecesCheckingKing(king, undefined);
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
    const previousPosition = new Position(piece.position);

    piece.position.set(position);
    const king = this.getKing(piece.color);
    const isInCheck = !!king && this.isKingInCheck(king, target);

    piece.position.set(previousPosition);

    return isInCheck;
  }

  private removePieceAt(position: Position) {
    this._pieces = this._pieces.filter((piece) => !piece.isAt(position));
  }

  private getPossibleMoves(piece: Piece) {
    const positions = piece.getPossibleMoves();
    return positions.filter((position) => this.isMoveValid(piece, position));
  }

  private _check: Color | undefined = undefined;
  private _checkmate: Color | undefined = undefined;
  private _stalemate: Color | undefined = undefined;
  private _pieces: Array<Piece>;
  private _currentMove: Color = Color.White;
  private _lastMovedPiece: Piece | null = null;

  private onCheck: CheckAction | undefined;
  private onCheckMate: CheckAction | undefined;
  private onCheckResolve: (() => void) | undefined;
  private onStalemate: CheckAction | undefined;
  private onBoardChange: ((pieces: Array<Piece>) => void) | undefined;
}
