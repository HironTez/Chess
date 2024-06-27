import {
  Color,
  King,
  MutablePiece,
  Pawn,
  Piece,
  Rook,
  Type,
  getPieceClassByTypename,
} from "../pieces";
import { MutablePosition, Position, PositionInputT } from "../position";

import { isInLimit } from "../helpers";
import { getDiff, getSurroundingPositions, getWay } from "../position";

type PureOrPromise<T> = T | Promise<T>;

type GetPromotionVariant = (
  pawnPosition: Position,
) => PureOrPromise<Type.Queen | Type.Rook | Type.Bishop | Type.Knight>;
type TeamEventHandler = (color: Color) => void;
type BoardChangeEventHandler = (pieces: Piece[]) => void;
type PieceMoveEventHandler = (
  startPosition: Position,
  endPosition: Position,
) => void;
type PieceCaptureEventHandler = (
  startPosition: Position,
  endPosition: Position,
  capturedPosition: Position,
) => void;
type CastlingEventHandler = (
  kingStartPosition: Position,
  kingEndPosition: Position,
  rookStartPosition: Position,
  rookEndPosition: Position,
) => void;
type PiecePromotionEventHandler = (piecePosition: Position) => void;

enum CheckStatus {
  Check = "check",
  Checkmate = "checkmate",
  Stalemate = "stalemate",
}

export type BoardOptionsT = {
  getPromotionVariant?: GetPromotionVariant;
  onCheck?: TeamEventHandler;
  onCheckMate?: TeamEventHandler;
  onCheckResolve?: () => void;
  onStalemate?: TeamEventHandler;
  onBoardChange?: BoardChangeEventHandler;
  onMove?: PieceMoveEventHandler;
  onCapture?: PieceCaptureEventHandler;
  onCastling?: CastlingEventHandler;
  onPromotion?: PiecePromotionEventHandler;
};

/**
 * Chess board with a custom set of pieces
 * @param pieces a set of pieces
 * @param options board options
 */

export class CustomBoard {
  constructor(pieces: MutablePiece[], options?: BoardOptionsT) {
    this._pieces = pieces;

    this.getPromotionVariant = options?.getPromotionVariant;
    this.onCheck = options?.onCheck;
    this.onCheckMate = options?.onCheckMate;
    this.onCheckResolve = options?.onCheckResolve;
    this.onStalemate = options?.onStalemate;
    this.onBoardChange = options?.onBoardChange;
    this.onMove = options?.onMove;
    this.onCapture = options?.onCapture;
    this.onCastling = options?.onCastling;
    this.onPromotion = options?.onPromotion;

    this.handleBoardChange(null);
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
    return this._pieces.map((piece) => new Piece(piece));
  }
  get currentTurn() {
    return this._currentTurn;
  }

  getPieceAt(positionInput: PositionInputT) {
    const piece = this._getPieceAt(positionInput);
    return piece && new Piece(piece);
  }

  getPiecesByColor(color: Color) {
    const pieces = this._getPiecesByColor(color);
    return pieces.map((piece) => new Piece(piece));
  }

  getPossibleMoves(positionInput: PositionInputT) {
    const piece = this._getPieceAt(positionInput);
    if (!piece) return [];

    const positions = this._getPossibleMoves(piece);
    const validMoves = positions.filter((position) =>
      this.isMoveValid(piece, position),
    );
    return validMoves.map((position) => new Position(position));
  }

  async move(
    startPositionInput: PositionInputT,
    endPositionInput: PositionInputT,
  ) {
    const startPosition = new MutablePosition(startPositionInput);
    const endPosition = new MutablePosition(endPositionInput);
    if (!startPosition || !endPosition) return false;

    return await this.movePiece(startPosition, endPosition);
  }

  private _getPieceAt(positionInput: PositionInputT) {
    const position = new MutablePosition(positionInput);
    if (!position) return undefined;

    return this._pieces.find((piece) => piece.isAt(position));
  }

  private _getPiecesByColor(color: Color) {
    return this._pieces.filter((piece) => piece.color === color);
  }

  private _getPossibleMoves(piece: MutablePiece) {
    const positions = piece.getPossibleMoves();
    return positions.filter((position) => this.isMoveValid(piece, position));
  }

  private async movePiece(
    startPosition: MutablePosition,
    endPosition: MutablePosition,
  ) {
    const piece = this._getPieceAt(startPosition);
    if (!piece) return false;

    const { rook: castlingRook, newPosition: newRookPosition } =
      this.getCastlingRook(piece, endPosition);
    const castlingRookStartPosition = castlingRook?.position;

    const isMoveValid = this.isMoveValid(
      piece,
      endPosition,
      castlingRookStartPosition,
    );
    if (isMoveValid) {
      const enemyPosition =
        piece instanceof Pawn
          ? this.isEnPassantPossible(startPosition)
            ? this._lastMovedPiece!.position
            : endPosition
          : endPosition;

      const isCapturing = !!this.getPieceAt(enemyPosition);

      this.removePieceAt(enemyPosition);
      piece.move(endPosition);

      if (this.isPromotionPossible(piece)) {
        const pieceType =
          (await this.getPromotionVariant?.(new Position(piece.position))) ??
          Type.Queen;
        const pieceClass = getPieceClassByTypename(pieceType);

        this.removePieceAt(piece.position);
        this._pieces.push(new pieceClass(piece.position, piece.color));

        this.onPromotion?.(piece.position);
      }

      if (castlingRook && castlingRookStartPosition) {
        castlingRook.move(newRookPosition);

        this.onCastling?.(
          startPosition,
          endPosition,
          castlingRookStartPosition,
          newRookPosition,
        );
      } else if (isCapturing) {
        this.onCapture?.(startPosition, endPosition, enemyPosition);
      } else {
        this.onMove?.(startPosition, endPosition);
      }

      this.handleBoardChange(piece);

      return true;
    }

    return false;
  }

  private isEnPassantPossible(position: MutablePosition) {
    const target = this._lastMovedPiece;
    if (!(target instanceof Pawn)) return false;

    const isTargetJustMoved = target.isJustDoubleMoved();
    const isTargetOneSquareAway = target.position.distanceTo(position) === 1;
    const targetOnSide = target.position.y === position.y;

    return isTargetJustMoved && isTargetOneSquareAway && targetOnSide;
  }

  private isPromotionPossible(piece: MutablePiece) {
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

  private getKing(color: Color) {
    return this._pieces.find(
      (piece) => piece.type === Type.King && piece.color === color,
    ) as King | undefined;
  }

  private getCastlingRook(piece: MutablePiece, position: MutablePosition) {
    if (piece instanceof King) {
      if (!piece.isMoved) {
        const { xDiff, yDiff } = getDiff(piece.position, position);
        if (Math.abs(xDiff) === 2 && !yDiff) {
          const { x, y } = position;
          const rookPosX = x < 4 ? 0 : 7;
          const newRookPosX = x < 4 ? 3 : 5;
          const rook = this._getPieceAt({ x: rookPosX, y });
          if (rook instanceof Rook) {
            const rookIsMoved = rook?.isMoved;
            return {
              rook: rookIsMoved ? null : rook,
              newPosition: new MutablePosition({ x: newRookPosX, y }),
            };
          }
        }
      }
    }

    return {};
  }

  private handleBoardChange(lastMovedPiece: MutablePiece | null) {
    this._currentTurn = lastMovedPiece?.oppositeColor ?? this._currentTurn;
    this._lastMovedPiece = lastMovedPiece;

    this.onBoardChange?.(this.pieces);

    const king = this.getKing(this._currentTurn);
    if (!king) return;

    const checkStatus = this.getCheckStatus(king);
    const isInCheck = checkStatus === CheckStatus.Check;
    const isInCheckmate = checkStatus === CheckStatus.Checkmate;
    const isInStalemate = checkStatus === CheckStatus.Stalemate;
    if (this._check !== king.oppositeColor && !!this._check !== isInCheck) {
      if (isInCheck) {
        this._check = king.color;

        this.onCheck?.(king.color);
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

        this.onCheckMate?.(king.color);
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

        this.onStalemate?.(king.color);
      } else {
        this._stalemate = undefined;
      }
    }
  }

  private isMoveValid(
    piece: MutablePiece,
    position: MutablePosition,
    castlingRookPosition?: MutablePosition,
  ) {
    if (this._checkmate || this._check) return false;

    const isTurnRight = piece.color === this._currentTurn;
    if (!isTurnRight) return false;

    const isMoving = !!piece.position.distanceTo(position);
    if (!isMoving) return false;

    if (!isInLimit(0, position.x, 7) || !isInLimit(0, position.y, 7))
      return false;

    const canMove = this.canPieceMove(piece, position, castlingRookPosition);
    return canMove;
  }

  private canPieceMove(
    piece: MutablePiece,
    position: MutablePosition,
    castlingRookPosition?: MutablePosition,
  ) {
    const { xDiff } = getDiff(piece.position, position);
    const way = getWay(
      piece.position,
      castlingRookPosition && Math.abs(xDiff) === 2
        ? castlingRookPosition
        : position,
    );

    for (const pos of way) {
      const pieceOnWay = this._getPieceAt(pos);
      if (pieceOnWay) return false;
    }

    const target = this._getPieceAt(position);
    const targetIsEnemy = target?.color === piece.oppositeColor;
    if (targetIsEnemy || !target) {
      const canMove = piece.isMoveValid(
        position,
        target ?? null,
        this._lastMovedPiece,
        !!castlingRookPosition,
      );
      if (canMove) {
        const willBeCheck = this.willBeCheck(piece, position);

        if (castlingRookPosition) {
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
      const team = this._getPiecesByColor(king.color);
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

    const teamPieces = this._getPiecesByColor(king.color);
    if (teamPieces.length > 0) {
      for (const piece of teamPieces) {
        const possibleMoves = this._getPossibleMoves(piece);
        if (possibleMoves.length > 0) {
          return undefined;
        }
      }

      return CheckStatus.Stalemate;
    }

    return undefined;
  }

  private isKingInCheck(king: King, ignorePiece: MutablePiece | undefined) {
    return this.piecesCheckingKing(king, ignorePiece).length > 0;
  }

  private piecesCheckingKing(
    king: King,
    ignorePiece: MutablePiece | undefined,
  ) {
    const enemies = this._getPiecesByColor(king.oppositeColor);
    return enemies.filter(
      (enemy) =>
        this.canPieceMove(enemy, king.position) && enemy !== ignorePiece,
    );
  }

  private canPieceDefendKing(piece: MutablePiece) {
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

  private willBeCheck(piece: MutablePiece, position: MutablePosition): boolean {
    const target = this._getPieceAt(position);
    const previousPosition = new MutablePosition(piece.position);

    piece.position.set(position);
    const king = this.getKing(piece.color);
    const isInCheck = !!king && this.isKingInCheck(king, target);

    piece.position.set(previousPosition);

    return isInCheck;
  }

  private removePieceAt(position: MutablePosition) {
    this._pieces = this._pieces.filter((piece) => !piece.isAt(position));
  }

  private _check: Color | undefined = undefined;
  private _checkmate: Color | undefined = undefined;
  private _stalemate: Color | undefined = undefined;
  private _pieces: Array<MutablePiece>;
  private _currentTurn: Color = Color.White;
  private _lastMovedPiece: MutablePiece | null = null;

  private getPromotionVariant: GetPromotionVariant | undefined;
  private onCheck: TeamEventHandler | undefined;
  private onCheckMate: TeamEventHandler | undefined;
  private onCheckResolve: (() => void) | undefined;
  private onStalemate: TeamEventHandler | undefined;
  private onBoardChange: BoardChangeEventHandler | undefined;
  private onMove: PieceMoveEventHandler | undefined;
  private onCapture: PieceCaptureEventHandler | undefined;
  private onCastling: CastlingEventHandler | undefined;
  private onPromotion: PiecePromotionEventHandler | undefined;
}
