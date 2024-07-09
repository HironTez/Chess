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
import { getDiff, getPath, getSurroundingPositions } from "../position";

export type PromotionType = Type.Queen | Type.Rook | Type.Bishop | Type.Knight;

type PureOrPromise<T> = T | Promise<T>;

type GetPromotionVariant = (
  pawnPosition: Position,
) => PureOrPromise<PromotionType>;
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
type PiecePromotionEventHandler = (
  piecePosition: Position,
  newPieceType: PromotionType,
) => void;

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
  onStalemate?: () => void;
  onBoardChange?: BoardChangeEventHandler;
  onMove?: PieceMoveEventHandler;
  onCapture?: PieceCaptureEventHandler;
  onCastling?: CastlingEventHandler;
  onPromotion?: PiecePromotionEventHandler;
};

/**
 * Chess board with a custom set of pieces
 * @param {MutablePiece[]} pieces - A set of mutable chess pieces to initialize the board.
 * @param {BoardOptionsT} [options] - Board options to customize behavior.
 * @param {GetPromotionVariant} [options.getPromotionVariant] - A function to determine the promotion piece type for a pawn.
 * @param {TeamEventHandler} [options.onCheck] - Callback function triggered when a king is in check.
 * @param {TeamEventHandler} [options.onCheckMate] - Callback function triggered when a king is in checkmate.
 * @param {Function} [options.onCheckResolve] - Callback function triggered when a check is resolved.
 * @param {Function} [options.onStalemate] - Callback function triggered when the game is in stalemate.
 * @param {BoardChangeEventHandler} [options.onBoardChange] - Callback function triggered when the board state changes.
 * @param {PieceMoveEventHandler} [options.onMove] - Callback function triggered when a piece moves.
 * @param {PieceCaptureEventHandler} [options.onCapture] - Callback function triggered when a piece captures another piece.
 * @param {CastlingEventHandler} [options.onCastling] - Callback function triggered when castling occurs.
 * @param {PiecePromotionEventHandler} [options.onPromotion] - Callback function triggered when a pawn is promoted.
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

    const { castlingRook, castlingRookNewPosition } = this.getCastlingRook(
      piece,
      endPosition,
    );

    const isMoveValid = this.isMoveValid(
      piece,
      endPosition,
      castlingRook?.position,
    );
    if (!isMoveValid) return false;

    this.handleMovePiece(piece, endPosition);

    if (this.isPromotionPossible(piece)) {
      await this.handlePromotePawn(piece);
    }

    if (castlingRook) {
      this.handleMoveCastlingRook(
        piece,
        endPosition,
        castlingRook,
        castlingRookNewPosition,
      );
    }

    this.handleBoardChange(piece);

    return true;
  }

  private getCapturePosition(
    piece: MutablePiece,
    startPosition: MutablePosition,
    endPosition: MutablePosition,
  ) {
    if (piece instanceof Pawn && this.isEnPassantPossible(startPosition)) {
      return this._lastMovedPiece!.position;
    }

    return endPosition;
  }

  private handleMovePiece(piece: MutablePiece, endPosition: MutablePosition) {
    const readonlyPieceStartPosition = new Position(piece.position);
    const readonlyPIeceEndPosition = new Position(endPosition);

    const capturePosition = this.getCapturePosition(
      piece,
      piece.position,
      endPosition,
    );

    this.removePieceAt(capturePosition);
    piece.move(endPosition);

    const isCapturing = this.getPieceAt(capturePosition);
    if (isCapturing) {
      const readonlyCapturePosition = new Position(capturePosition);
      this.onCapture?.(
        readonlyPieceStartPosition,
        readonlyPIeceEndPosition,
        readonlyCapturePosition,
      );
    } else {
      this.onMove?.(readonlyPieceStartPosition, readonlyPIeceEndPosition);
    }
  }

  private async handlePromotePawn(piece: MutablePiece) {
    const readonlyPiecePosition = new Position(piece.position);

    const pieceTypeInput = await this.getPromotionVariant?.(
      readonlyPiecePosition,
    );
    const pieceType = pieceTypeInput ?? Type.Queen;
    const pieceClass = getPieceClassByTypename(pieceType);

    this.removePieceAt(piece.position);
    this._pieces.push(new pieceClass(piece.position, piece.color));

    this.onPromotion?.(readonlyPiecePosition, pieceType);
  }

  private handleMoveCastlingRook(
    king: MutablePiece,
    kingNewPosition: MutablePosition,
    rook: MutablePiece,
    newRookPosition: MutablePosition,
  ) {
    const readonlyKingStartPosition = new Position(king.position);
    const readonlyKingEndPosition = new Position(kingNewPosition);
    const readonlyRookStartPosition = new Position(rook.position);
    const readonlyRookEndPosition = new Position(newRookPosition);

    rook.move(newRookPosition);

    this.onCastling?.(
      readonlyKingStartPosition,
      readonlyKingEndPosition,
      readonlyRookStartPosition,
      readonlyRookEndPosition,
    );
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
      (piece): piece is King =>
        piece.type === Type.King && piece.color === color,
    );
  }

  private getCastlingRook(piece: MutablePiece, position: MutablePosition) {
    if (piece instanceof King && piece.isMoved === false) {
      const { xDiff, yDiff } = getDiff(piece.position, position);
      const kingMoves2SquaresHorizontally = Math.abs(xDiff) === 2 && !yDiff;
      if (kingMoves2SquaresHorizontally) {
        const { x, y } = position;
        const rookPosX = x < 4 ? 0 : 7;
        const newRookPosX = x < 4 ? 3 : 5;
        const rook = this._getPieceAt({ x: rookPosX, y });
        if (rook instanceof Rook && rook.isMoved === false) {
          return {
            castlingRook: rook,
            castlingRookNewPosition: new MutablePosition({
              x: newRookPosX,
              y,
            }),
          };
        }
      }
    }

    return {};
  }

  private handleBoardChange(lastMovedPiece: MutablePiece | null) {
    this._currentTurn = lastMovedPiece?.oppositeColor ?? this._currentTurn;
    this._lastMovedPiece = lastMovedPiece;

    const king = this.getKing(this._currentTurn);
    if (!king) return;

    this.updateCheckStatus(king);

    this.onBoardChange?.(this.pieces);
  }

  private updateCheckStatus(king: King) {
    const checkStatus = this.getCheckStatus(king);
    const isInCheck = checkStatus === CheckStatus.Check;
    const isInCheckmate = checkStatus === CheckStatus.Checkmate;
    const isInStalemate = checkStatus === CheckStatus.Stalemate;

    const isOppositeKingInCheck = this._check === king.oppositeColor;
    const isCheckStatusChanged = !!this._check !== isInCheck;
    if (!isOppositeKingInCheck && isCheckStatusChanged) {
      this._check = isInCheck ? king.color : undefined;
      if (isInCheck) {
        this.onCheck?.(king.color);
      } else {
        this.onCheckResolve?.();
      }
    }
    if (isInCheckmate) {
      this._checkmate = king.color;
      this._check = king.color;
      this.onCheckMate?.(king.color);
    }
    if (isInStalemate) {
      this._stalemate = true;
      this.onStalemate?.();
    }
  }

  private isMoveValid(
    piece: MutablePiece,
    position: MutablePosition,
    castlingRookPosition?: MutablePosition,
  ) {
    if (this._checkmate || this._stalemate) return false;

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
    if (
      castlingRookPosition &&
      !this.isCastlingPossible(piece, position, castlingRookPosition)
    ) {
      return false;
    }

    const endPosition = castlingRookPosition ?? position;
    const path = getPath(piece.position, endPosition);

    if (!this.isPathClear(path)) {
      return false;
    }

    const target = this._getPieceAt(position);
    const targetIsEnemy = target?.color === piece.oppositeColor;

    if (target && !targetIsEnemy) {
      return false;
    }

    const canPieceMove = piece.canMove(position);
    if (canPieceMove) {
      return (
        !this.willBeCheck(piece, position) &&
        this.isCastlingPathClear(path, piece, castlingRookPosition)
      );
    }

    return false;
  }

  private isPathClear(path: MutablePosition[]) {
    for (const pos of path) {
      if (this._getPieceAt(pos)) {
        return false;
      }
    }
    return true;
  }

  private isCastlingPathClear(
    path: MutablePosition[],
    piece: MutablePiece,
    castlingRookPosition?: MutablePosition,
  ) {
    if (!castlingRookPosition) {
      return true;
    }

    for (const pos of path) {
      if (this.willBeCheck(piece, pos)) {
        return false;
      }
    }

    return true;
  }

  private isCastlingPossible(
    piece: MutablePiece,
    endPosition: MutablePosition,
    castlingRookPosition: MutablePosition,
  ) {
    if (
      !(piece instanceof King) ||
      piece.isMoved ||
      this._check === piece.color
    )
      return false;

    const { yDiff } = getDiff(piece.position, endPosition);
    const isKingMovingTwoSquaresHorizontally =
      yDiff === 0 && piece.position.distanceTo(endPosition) === 2;

    const isRookPositionValid =
      (piece.position.distanceTo(castlingRookPosition) === 3 &&
        castlingRookPosition.x === 7) ||
      (piece.position.distanceTo(castlingRookPosition) === 4 &&
        castlingRookPosition.x === 0);

    if (!isKingMovingTwoSquaresHorizontally || !isRookPositionValid)
      return false;

    const rook = this._getPieceAt(castlingRookPosition);
    return rook instanceof Rook && !rook.isMoved && piece.color === rook.color;
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

      const enemyPath = getPath(enemy.position, king.position);
      for (const position of enemyPath) {
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
  private _stalemate: boolean = false;
  private _pieces: Array<MutablePiece>;
  private _currentTurn: Color = Color.White;
  private _lastMovedPiece: MutablePiece | null = null;

  private getPromotionVariant: GetPromotionVariant | undefined;
  private onCheck: TeamEventHandler | undefined;
  private onCheckMate: TeamEventHandler | undefined;
  private onCheckResolve: (() => void) | undefined;
  private onStalemate: (() => void) | undefined;
  private onBoardChange: BoardChangeEventHandler | undefined;
  private onMove: PieceMoveEventHandler | undefined;
  private onCapture: PieceCaptureEventHandler | undefined;
  private onCastling: CastlingEventHandler | undefined;
  private onPromotion: PiecePromotionEventHandler | undefined;
}
