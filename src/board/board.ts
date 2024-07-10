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

export enum Event {
  BoardChange = "boardChange",
  Check = "check",
  Checkmate = "checkmate",
  CheckResolve = "checkResolve",
  Stalemate = "stalemate",
  Move = "move",
  Capture = "capture",
  Castling = "castling",
  Promotion = "promotion",
}

export type EventHandlerT = {
  GetPromotionVariant: (
    piecePosition: Position,
  ) => PromotionType | Promise<PromotionType>;
  BoardChange: (pieces: Piece[]) => void;
  Check: (color: Color) => void;
  Checkmate: (color: Color) => void;
  CheckResolve: () => void;
  Stalemate: () => void;
  Move: (startPosition: Position, endPosition: Position) => void;
  Capture: (
    startPosition: Position,
    endPosition: Position,
    capturedPosition: Position,
  ) => void;
  Castling: (
    kingStartPosition: Position,
    kingEndPosition: Position,
    rookStartPosition: Position,
    rookEndPosition: Position,
  ) => void;
  Promotion: (piecePosition: Position, newPieceType: PromotionType) => void;
};

enum Status {
  Check = "check",
  Checkmate = "checkmate",
  Stalemate = "stalemate",
}

export type BoardOptionsT = {
  getPromotionVariant?: EventHandlerT["GetPromotionVariant"];
  onBoardChange?: EventHandlerT["BoardChange"];
  onCheck?: EventHandlerT["Check"];
  onCheckMate?: EventHandlerT["Checkmate"];
  onCheckResolve?: EventHandlerT["CheckResolve"];
  onStalemate?: EventHandlerT["Stalemate"];
  onMove?: EventHandlerT["Move"];
  onCapture?: EventHandlerT["Capture"];
  onCastling?: EventHandlerT["Castling"];
  onPromotion?: EventHandlerT["Promotion"];
};

/**
 * Chess board with a custom set of pieces
 * @param {MutablePiece[]} pieces - A set of mutable chess pieces to initialize the board.
 * @param {BoardOptionsT} [options] - Board options to customize behavior.
 * @param {EventHandlerT["GetPromotionVariant"]} [options.getPromotionVariant] - A function to determine the promotion piece type for a pawn.
 * @param {EventHandlerT["BoardChange"]} [options.onBoardChange] - Callback function triggered when the board state changes.
 * @param {EventHandlerT["Check"]} [options.onCheck] - Callback function triggered when a king is in check.
 * @param {EventHandlerT["Checkmate"]} [options.onCheckMate] - Callback function triggered when a king is in checkmate.
 * @param {EventHandlerT["CheckResolve"]} [options.onCheckResolve] - Callback function triggered when a check is resolved.
 * @param {EventHandlerT["Stalemate"]} [options.onStalemate] - Callback function triggered when the game is in stalemate.
 * @param {EventHandlerT["Move"]} [options.onMove] - Callback function triggered when a piece moves.
 * @param {EventHandlerT["Capture"]} [options.onCapture] - Callback function triggered when a piece captures another piece.
 * @param {EventHandlerT["Castling"]} [options.onCastling] - Callback function triggered when castling occurs.
 * @param {EventHandlerT["Promotion"]} [options.onPromotion] - Callback function triggered when a pawn is promoted.
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

  on(
    event: Event.BoardChange,
    eventHandlerT: EventHandlerT["BoardChange"],
  ): void;
  on(event: Event.Check, eventHandlerT: EventHandlerT["Check"]): void;
  on(event: Event.Checkmate, eventHandlerT: EventHandlerT["Checkmate"]): void;
  on(
    event: Event.CheckResolve,
    eventHandlerT: EventHandlerT["CheckResolve"],
  ): void;
  on(event: Event.Stalemate, eventHandlerT: EventHandlerT["Stalemate"]): void;
  on(event: Event.Move, eventHandlerT: EventHandlerT["Move"]): void;
  on(event: Event.Capture, eventHandlerT: EventHandlerT["Capture"]): void;
  on(event: Event.Castling, eventHandlerT: EventHandlerT["Castling"]): void;
  on(event: Event.Promotion, eventHandlerT: EventHandlerT["Promotion"]): void;
  on(event: Event, eventHandlerT: EventHandlerT[keyof EventHandlerT]) {
    switch (event) {
      case Event.Check:
        this.onCheck = eventHandlerT as typeof this.onCheck;
        break;
      case Event.Checkmate:
        this.onCheckMate = eventHandlerT as typeof this.onCheckMate;
        break;
      case Event.CheckResolve:
        this.onCheckResolve = eventHandlerT as typeof this.onCheckResolve;
        break;
      case Event.Stalemate:
        this.onStalemate = eventHandlerT as typeof this.onStalemate;
        break;
      case Event.BoardChange:
        this.onBoardChange = eventHandlerT as typeof this.onBoardChange;
        break;
      case Event.Move:
        this.onMove = eventHandlerT as typeof this.onMove;
        break;
      case Event.Capture:
        this.onCapture = eventHandlerT as typeof this.onCapture;
        break;
      case Event.Castling:
        this.onCastling = eventHandlerT as typeof this.onCastling;
        break;
      case Event.Promotion:
        this.onPromotion = eventHandlerT as typeof this.onPromotion;
        break;
    }
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

    const positions = this._getLegalMovesOf(piece);
    return positions.map((position) => new Position(position));
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

  private _getLegalMovesOf(piece: MutablePiece) {
    const positions = piece.getPossibleMoves();
    return positions.filter((position) => this.isMoveLegal(piece, position));
  }

  private hasPieceLegalMoves(piece: MutablePiece) {
    const positions = piece.getPossibleMoves();
    return positions.some((position) => this.isMoveLegal(piece, position));
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

    const isMoveValid = this.isMoveLegal(
      piece,
      endPosition,
      castlingRook?.position,
    );
    if (!isMoveValid) return false;

    if (castlingRook) {
      this.handleCastle(
        piece,
        endPosition,
        castlingRook,
        castlingRookNewPosition,
      );
    } else {
      this.handleMovePiece(piece, endPosition);

      if (this.isPromotionPossible(piece)) {
        await this.handlePromotePawn(piece);
      }
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
    const readonlyPieceEndPosition = new Position(endPosition);

    const capturePosition = this.getCapturePosition(
      piece,
      piece.position,
      endPosition,
    );

    const isCapturing = this.getPieceAt(capturePosition);
    this.removePieceAt(capturePosition);
    piece.move(endPosition);

    if (isCapturing) {
      const readonlyCapturePosition = new Position(capturePosition);
      this.onCapture?.(
        readonlyPieceStartPosition,
        readonlyPieceEndPosition,
        readonlyCapturePosition,
      );
    } else {
      this.onMove?.(readonlyPieceStartPosition, readonlyPieceEndPosition);
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

  private handleCastle(
    king: MutablePiece,
    kingEndPosition: MutablePosition,
    rook: MutablePiece,
    rookEndPosition: MutablePosition,
  ) {
    const readonlyKingStartPosition = new Position(king.position);
    const readonlyKingEndPosition = new Position(kingEndPosition);
    const readonlyRookStartPosition = new Position(rook.position);
    const readonlyRookEndPosition = new Position(rookEndPosition);

    king.move(kingEndPosition);
    rook.move(rookEndPosition);

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

    this.updateStatus(king);

    this.onBoardChange?.(this.pieces);
  }

  private updateStatus(king: King) {
    if (this._check === king.oppositeColor) {
      this._check = null;
      this.onCheckResolve?.();
    }

    const status = this.getStatus(king);
    const isInCheck = status === Status.Check;
    const isInCheckmate = status === Status.Checkmate;
    const isInStalemate = status === Status.Stalemate;

    if (isInCheck) {
      this._check = king.color;
      this.onCheck?.(king.color);
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

  private isMoveLegal(
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

  private getStatus(king: King) {
    const isInCheck = this.isKingInCheck(king, undefined);
    if (isInCheck) {
      const team = this._getPiecesByColor(king.color);
      for (const teammate of team) {
        if (teammate === king) continue;

        const canDefendKing = this.canPieceDefendKing(teammate);
        if (canDefendKing) {
          return Status.Check;
        }
      }

      const surroundingPositions = getSurroundingPositions(king.position);
      for (const position of surroundingPositions) {
        const canEscape = this.canPieceMove(king, position);
        if (canEscape) {
          return Status.Check;
        }
      }

      return Status.Checkmate;
    }

    const piecesExceptKings = this._pieces.filter(
      (piece) => piece.type !== Type.King,
    );
    if (piecesExceptKings.length === 0) {
      return Status.Stalemate;
    }

    const teamPieces = this._getPiecesByColor(king.color);
    for (const piece of teamPieces) {
      const hasLegalMoves = this.hasPieceLegalMoves(piece);
      if (hasLegalMoves) {
        return undefined;
      }
    }

    return Status.Stalemate;
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

  private _check: Color | null = null;
  private _checkmate: Color | null = null;
  private _stalemate: boolean = false;
  private _pieces: Array<MutablePiece>;
  private _currentTurn: Color = Color.White;
  private _lastMovedPiece: MutablePiece | null = null;

  private getPromotionVariant: EventHandlerT["GetPromotionVariant"] | undefined;
  private onBoardChange: EventHandlerT["BoardChange"] | undefined;
  private onCheck: EventHandlerT["Check"] | undefined;
  private onCheckMate: EventHandlerT["Checkmate"] | undefined;
  private onCheckResolve: EventHandlerT["CheckResolve"] | undefined;
  private onStalemate: EventHandlerT["Stalemate"] | undefined;
  private onMove: EventHandlerT["Move"] | undefined;
  private onCapture: EventHandlerT["Capture"] | undefined;
  private onCastling: EventHandlerT["Castling"] | undefined;
  private onPromotion: EventHandlerT["Promotion"] | undefined;
}

// TODO: history of moves
// TODO: undone
