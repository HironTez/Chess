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
import {
  MutablePosition,
  Position,
  PositionInputT,
  areAlignedHorizontally,
  areAlignedVertically,
} from "../position";

import { invertColor } from "src/pieces/piece";
import { isInLimit } from "../helpers";
import { getDiff, getPath, getSurroundingPositions } from "../position";

export enum MoveType {
  Move = "move",
  Capture = "capture",
  Castling = "castling",
  Promotion = "promotion",
}

type DynamicMoveT<T extends Position> = {
  startPosition: T;
  endPosition: T;
  pieceId: string;
} & (
  | {
      type: MoveType.Move;
    }
  | {
      type: MoveType.Capture;
      capturedPosition: T;
    }
  | {
      type: MoveType.Castling;
      castlingRookStartPosition: T;
      castlingRookEndPosition: T;
    }
  | { type: MoveType.Promotion; newPieceType: PromotionTypeT }
);

export type MoveT = DynamicMoveT<Position>;
type MutableMoveT = DynamicMoveT<MutablePosition>;

export type MoveReturnT = { success: false } | ({ success: true } & MoveT);

export type PromotionTypeT = Type.Queen | Type.Rook | Type.Bishop | Type.Knight;

export enum Event {
  BoardChange = "boardChange",
  Check = "check",
  Checkmate = "checkmate",
  CheckResolve = "checkResolve",
  Draw = "draw",
  Move = "move",
  Capture = "capture",
  Castling = "castling",
  Promotion = "promotion",
}

export type EventHandlerT = {
  GetPromotionVariant: (
    piecePosition: Position,
  ) => PromotionTypeT | Promise<PromotionTypeT>;
  BoardChange: (pieces: Piece[]) => void;
  Check: (color: Color) => void;
  Checkmate: (color: Color) => void;
  CheckResolve: () => void;
  Draw: () => void;
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
  Promotion: (piecePosition: Position, newPieceType: PromotionTypeT) => void;
};

enum Status {
  Check = "check",
  Checkmate = "checkmate",
  Draw = "draw",
}

export type BoardOptionsT = {
  getPromotionVariant?: EventHandlerT["GetPromotionVariant"];
  onBoardChange?: EventHandlerT["BoardChange"];
  onCheck?: EventHandlerT["Check"];
  onCheckMate?: EventHandlerT["Checkmate"];
  onCheckResolve?: EventHandlerT["CheckResolve"];
  onDraw?: EventHandlerT["Draw"];
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
 * @param {EventHandlerT["Draw"]} [options.onDraw] - Callback function triggered when the game is in draw.
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
    this.onDraw = options?.onDraw;
    this.onBoardChange = options?.onBoardChange;
    this.onMove = options?.onMove;
    this.onCapture = options?.onCapture;
    this.onCastling = options?.onCastling;
    this.onPromotion = options?.onPromotion;

    this.handleBoardChange(null);
  }

  get checkColor() {
    return this._checkColor;
  }
  get checkmateColor() {
    return this._checkmateColor;
  }
  get isDraw() {
    return this._isDraw;
  }
  get winnerColor() {
    return this._checkmateColor && invertColor(this._checkmateColor);
  }
  get pieces() {
    return this._pieces.map((piece) => new Piece(piece));
  }
  get currentTurnColor() {
    return this._currentTurnColor;
  }
  get history() {
    return this._history.map(this.makeMoveReadonly);
  }
  get capturedPieces() {
    return this._capturedPieces.map((piece) => new Piece(piece));
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
  on(event: Event.Draw, eventHandlerT: EventHandlerT["Draw"]): void;
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
      case Event.Draw:
        this.onDraw = eventHandlerT as typeof this.onDraw;
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

  getCapturedPiecesByColor(color: Color) {
    return this._capturedPieces
      .filter((piece) => piece.color === color)
      .map((piece) => new Piece(piece));
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
  ): Promise<MoveReturnT> {
    const startPosition = new MutablePosition(startPositionInput);
    const endPosition = new MutablePosition(endPositionInput);
    if (!startPosition || !endPosition) return { success: false };

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
    return positions.filter((position) => this.isMoveValid(piece, position));
  }

  private hasPieceLegalMoves(piece: MutablePiece) {
    const positions = piece.getPossibleMoves();
    return positions.some((position) => this.isMoveValid(piece, position));
  }

  private makeMoveReadonly(mutableMove: MutableMoveT) {
    const move: MoveT = { ...mutableMove };
    for (const keyName in move) {
      const key = keyName as keyof typeof move;
      const value = move[key];
      if (value instanceof MutablePosition) {
        (move as any)[key] = new Position(value);
      }
    }

    return move;
  }

  private async movePiece(
    startPosition: MutablePosition,
    endPosition: MutablePosition,
  ): Promise<MoveReturnT> {
    const unsuccessfulMove: MoveReturnT = { success: false };

    const piece = this._getPieceAt(startPosition);
    if (!piece) return unsuccessfulMove;

    let mutableMove = this.checkMove(piece, endPosition);
    if (!mutableMove) return unsuccessfulMove;

    if (mutableMove.type === MoveType.Castling) {
      this.handleCastle(
        piece,
        mutableMove.endPosition,
        mutableMove.castlingRookStartPosition,
        mutableMove.castlingRookEndPosition,
      );

      mutableMove = {
        ...mutableMove,
        type: MoveType.Castling,
        castlingRookStartPosition: mutableMove.castlingRookStartPosition,
        castlingRookEndPosition: mutableMove.castlingRookEndPosition,
      };
    } else {
      const pieceToCapture =
        mutableMove.type === MoveType.Capture
          ? this._getPieceAt(mutableMove.capturedPosition) ?? null
          : null;

      this.handleMovePiece(piece, mutableMove.endPosition, pieceToCapture);

      if (this.isPromotionPossible(piece)) {
        const pieceType = await this.handlePromotePawn(piece);

        mutableMove = {
          ...mutableMove,
          type: MoveType.Promotion,
          newPieceType: pieceType,
        };
      } else if (pieceToCapture) {
        mutableMove = {
          ...mutableMove,
          type: MoveType.Capture,
          capturedPosition: pieceToCapture.position,
        };
      }
    }

    this._history.push(mutableMove);

    this.handleBoardChange(piece);

    return {
      success: true,
      ...this.makeMoveReadonly(mutableMove),
    };
  }

  private getCapturePosition(
    piece: MutablePiece,
    endPosition: MutablePosition,
  ) {
    const lastMovedPiece = this._lastMovedPiece;
    if (
      piece instanceof Pawn &&
      this.isEnPassantPossible(piece, endPosition, lastMovedPiece)
    ) {
      return lastMovedPiece.position;
    }

    return endPosition;
  }

  private handleMovePiece(
    piece: MutablePiece,
    endPosition: MutablePosition,
    pieceToCapture: MutablePiece | null,
  ) {
    const readonlyPieceStartPosition = new Position(piece.position);
    const readonlyPieceEndPosition = new Position(endPosition);

    if (pieceToCapture) {
      this._capturedPieces.push(pieceToCapture);
      this.removePiece(pieceToCapture);
    }

    piece.move(endPosition);

    if (pieceToCapture) {
      const readonlyCapturePosition = new Position(pieceToCapture.position);
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

    this.removePiece(piece);
    this._pieces.push(new pieceClass(piece.position, piece.color));

    this.onPromotion?.(readonlyPiecePosition, pieceType);

    return pieceType;
  }

  private handleCastle(
    king: MutablePiece,
    kingEndPosition: MutablePosition,
    rookStartPosition: MutablePosition,
    rookEndPosition: MutablePosition,
  ) {
    const readonlyKingStartPosition = new Position(king.position);
    const readonlyKingEndPosition = new Position(kingEndPosition);
    const readonlyRookStartPosition = new Position(rookStartPosition);
    const readonlyRookEndPosition = new Position(rookEndPosition);

    const rook = this._getPieceAt(rookStartPosition);

    king.move(kingEndPosition);
    rook?.move(rookEndPosition);

    this.onCastling?.(
      readonlyKingStartPosition,
      readonlyKingEndPosition,
      readonlyRookStartPosition,
      readonlyRookEndPosition,
    );
  }

  private isEnPassantPossible(
    piece: MutablePiece,
    endPosition: MutablePosition,
    lastMovedPiece: MutablePiece | null,
  ): lastMovedPiece is Pawn {
    const target = lastMovedPiece;
    if (!(target instanceof Pawn)) return false;

    const isTargetJustDoubleMoved = target.isJustDoubleMoved();
    const isTargetOneSquareAway =
      target.position.distanceTo(piece.position) === 1;
    const isTargetOnSideBelowEndPosition =
      areAlignedVertically(target.position, piece.position) &&
      areAlignedHorizontally(target.position, endPosition);

    return (
      isTargetJustDoubleMoved &&
      isTargetOneSquareAway &&
      isTargetOnSideBelowEndPosition
    );
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

  private getCastlingRook(piece: MutablePiece, endPosition: MutablePosition) {
    if (
      piece instanceof King &&
      piece.isMoved === false &&
      this._checkColor === null
    ) {
      const { xDiff, yDiff } = getDiff(piece.position, endPosition);
      const isKingMovingTwoSquaresHorizontally =
        Math.abs(xDiff) === 2 && !yDiff;
      if (isKingMovingTwoSquaresHorizontally) {
        const { x, y } = endPosition;
        const rookPosX = x < 4 ? 0 : 7;
        const newRookPosX = x < 4 ? 3 : 5;
        const rook = this._getPieceAt({ x: rookPosX, y });
        if (
          rook instanceof Rook &&
          rook.isMoved === false &&
          rook.color === piece.color
        ) {
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
    this._currentTurnColor =
      lastMovedPiece?.oppositeColor ?? this._currentTurnColor;
    this._lastMovedPiece = lastMovedPiece;

    const king = this.getKing(this._currentTurnColor);
    if (!king) return;

    this.updateStatus(king);

    this.onBoardChange?.(this.pieces);
  }

  private updateStatus(king: King) {
    if (this._checkColor === king.oppositeColor) {
      this._checkColor = null;
      this.onCheckResolve?.();
    }

    const status = this.getStatus(king);
    const isInCheck = status === Status.Check;
    const isInCheckmate = status === Status.Checkmate;
    const isInDraw = status === Status.Draw;

    if (isInCheck) {
      this._checkColor = king.color;
      this.onCheck?.(king.color);
    }
    if (isInCheckmate) {
      this._checkmateColor = king.color;
      this._checkColor = king.color;
      this.onCheckMate?.(king.color);
    }
    if (isInDraw) {
      this._isDraw = true;
      this.onDraw?.();
    }
  }

  private isMoveValid(...args: Parameters<typeof this.checkMove>) {
    return !!this.checkMove(...args);
  }

  private checkMove(
    piece: MutablePiece,
    endPosition: MutablePosition,
    ignoreTurn?: "ignoreTurn",
  ): MutableMoveT | undefined {
    if (this._checkmateColor || this._isDraw) return undefined;

    const isTurnRight = !!ignoreTurn || piece.color === this._currentTurnColor;
    if (!isTurnRight) return undefined;

    const isMoving = !!piece.position.distanceTo(endPosition);
    if (!isMoving) return undefined;

    if (!isInLimit(0, endPosition.x, 7) || !isInLimit(0, endPosition.y, 7))
      return undefined;

    const move: MutableMoveT = {
      type: MoveType.Move,
      startPosition: new MutablePosition(piece.position),
      endPosition: new MutablePosition(endPosition),
      pieceId: piece.id,
    };

    const { castlingRook, castlingRookNewPosition } = this.getCastlingRook(
      piece,
      endPosition,
    );

    if (castlingRook) {
      const path = getPath(piece.position, castlingRook.position);
      const isPathClear = this.isPathClear(path);
      const isCastlingSafe = this.isCastlingSafe(piece, endPosition);
      if (!isPathClear || !isCastlingSafe) {
        return undefined;
      }

      return {
        ...move,
        type: MoveType.Castling,
        castlingRookStartPosition: new MutablePosition(castlingRook.position),
        castlingRookEndPosition: new MutablePosition(castlingRookNewPosition),
      };
    }

    const path = getPath(piece.position, endPosition);
    if (!this.isPathClear(path)) {
      return undefined;
    }

    const capturePosition = this.getCapturePosition(piece, endPosition);
    const target = this._getPieceAt(capturePosition);
    const isTargetEnemy = target?.color === piece.oppositeColor;
    if (target && !isTargetEnemy) {
      return undefined;
    }

    const canPieceMove = piece.canMove(
      endPosition,
      isTargetEnemy,
      !!castlingRook,
    );
    if (canPieceMove && !this.willBeCheck(piece, endPosition)) {
      if (isTargetEnemy) {
        return {
          ...move,
          type: MoveType.Capture,
          capturedPosition: new MutablePosition(capturePosition),
        };
      }
      return move;
    }

    return undefined;
  }

  private isPathClear(path: MutablePosition[]) {
    for (const pos of path) {
      if (this._getPieceAt(pos)) {
        return false;
      }
    }
    return true;
  }

  private isCastlingSafe(king: MutablePiece, kingEndPosition: MutablePosition) {
    const path = getPath(king.position, kingEndPosition).concat(
      kingEndPosition,
    );
    for (const pos of path) {
      if (this.willBeCheck(king, pos)) {
        return false;
      }
    }

    return true;
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
        const canEscape = this.isMoveValid(king, position);
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
      return Status.Draw;
    }

    // const lastMovedPiece = this._lastMovedPiece;
    // if (lastMovedPiece) {
    //   const lastMovedPiecePosition = lastMovedPiece.position;
    //   const lastMovedPieceId = lastMovedPiece.id;

    //   const repeatedMoves = this._history.filter(
    //     (move) =>
    //       move.pieceId === lastMovedPieceId &&
    //       move.endPosition.distanceTo(lastMovedPiecePosition) === 0,
    //   );

    //   if (repeatedMoves.length >= 3) {
    //     return Status.Draw;
    //   }
    // }

    const teamPieces = this._getPiecesByColor(king.color);
    for (const piece of teamPieces) {
      const hasLegalMoves = this.hasPieceLegalMoves(piece);
      if (hasLegalMoves) {
        return undefined;
      }
    }

    return Status.Draw;
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
        this.isMoveValid(enemy, king.position, "ignoreTurn") &&
        enemy !== ignorePiece,
    );
  }

  private canPieceDefendKing(piece: MutablePiece) {
    const king = this.getKing(piece.color);
    if (!king) return false;

    const enemiesCheckingKing = this.piecesCheckingKing(king, undefined);
    for (const enemy of enemiesCheckingKing) {
      const canCaptureEnemy = this.isMoveValid(piece, enemy.position);
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
        const canCover = this.isMoveValid(piece, position);
        const willCancelCheck = this.willBeCheck(piece, position);

        if (canCover && willCancelCheck) {
          return false;
        }
      }
    }

    return true;
  }

  private willBeCheck(
    piece: MutablePiece,
    endPosition: MutablePosition,
  ): boolean {
    const target = this._getPieceAt(endPosition);
    const previousPosition = new MutablePosition(piece.position);

    piece.position.set(endPosition);
    const king = this.getKing(piece.color);
    const isInCheck = !!king && this.isKingInCheck(king, target);

    piece.position.set(previousPosition);

    return isInCheck;
  }

  private removePiece(piece: MutablePiece) {
    const i = this._pieces.indexOf(piece);
    this._pieces.splice(i, 1);
  }

  private _checkColor: Color | null = null;
  private _checkmateColor: Color | null = null;
  private _isDraw: boolean = false;
  private _pieces: Array<MutablePiece>;
  private _currentTurnColor: Color = Color.White;
  private _lastMovedPiece: MutablePiece | null = null;
  private _history: Array<MutableMoveT> = [];
  private _capturedPieces: Array<MutablePiece> = [];

  private getPromotionVariant: EventHandlerT["GetPromotionVariant"] | undefined;
  private onBoardChange: EventHandlerT["BoardChange"] | undefined;
  private onCheck: EventHandlerT["Check"] | undefined;
  private onCheckMate: EventHandlerT["Checkmate"] | undefined;
  private onCheckResolve: EventHandlerT["CheckResolve"] | undefined;
  private onDraw: EventHandlerT["Draw"] | undefined;
  private onMove: EventHandlerT["Move"] | undefined;
  private onCapture: EventHandlerT["Capture"] | undefined;
  private onCastling: EventHandlerT["Castling"] | undefined;
  private onPromotion: EventHandlerT["Promotion"] | undefined;
}

// FIXME: threefold repetition
// TODO: undone
