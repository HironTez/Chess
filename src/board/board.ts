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
import { hashPositions } from "./helpers";

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
  Draw = "draw",
  CheckResolve = "checkResolve",
  CheckmateResolve = "checkmateResolve",
  DrawResolve = "drawResolve",
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
  Draw: () => void;
  CheckResolve: () => void;
  CheckmateResolve: () => void;
  DrawResolve: () => void;
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

type MoveValidationOptions = {
  ignoreTurn?: boolean;
  ignoreCheckmate?: boolean;
  ignoreDraw?: boolean;
};

export type BoardOptionsT = {
  getPromotionVariant?: EventHandlerT["GetPromotionVariant"];
  onBoardChange?: EventHandlerT["BoardChange"];
  onCheck?: EventHandlerT["Check"];
  onCheckmate?: EventHandlerT["Checkmate"];
  onDraw?: EventHandlerT["Draw"];
  onCheckResolve?: EventHandlerT["CheckResolve"];
  onCheckmateResolve?: EventHandlerT["CheckResolve"];
  onDrawResolve?: EventHandlerT["CheckResolve"];
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
 * @param {EventHandlerT["Checkmate"]} [options.onCheckmate] - Callback function triggered when a king is in checkmate.
 * @param {EventHandlerT["Draw"]} [options.onDraw] - Callback function triggered when the game is in draw.
 * @param {EventHandlerT["CheckResolve"]} [options.onCheckResolve] - Callback function triggered when a check is resolved.
 * @param {EventHandlerT["CheckmateResolve"]} [options.onCheckmateResolve] - Callback function triggered when a checkmate is resolved (with .undo()).
 * @param {EventHandlerT["DrawResolve"]} [options.onDrawResolve] - Callback function triggered when a draw is resolved (with .undo()).
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
    this.onCheckmate = options?.onCheckmate;
    this.onDraw = options?.onDraw;
    this.onCheckResolve = options?.onCheckResolve;
    this.onCheckmateResolve = options?.onCheckmateResolve;
    this.onDrawResolve = options?.onDrawResolve;
    this.onBoardChange = options?.onBoardChange;
    this.onMove = options?.onMove;
    this.onCapture = options?.onCapture;
    this.onCastling = options?.onCastling;
    this.onPromotion = options?.onPromotion;

    this.hashPositions();

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
    return this._historyMoves.map(this.makeMoveReadonly);
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
        this.onCheckmate = eventHandlerT as typeof this.onCheckmate;
        break;
      case Event.Draw:
        this.onDraw = eventHandlerT as typeof this.onDraw;
        break;
      case Event.CheckResolve:
        this.onCheckResolve = eventHandlerT as typeof this.onCheckResolve;
        break;
      case Event.CheckmateResolve:
        this.onCheckmateResolve =
          eventHandlerT as typeof this.onCheckmateResolve;
        break;
      case Event.DrawResolve:
        this.onDrawResolve = eventHandlerT as typeof this.onDrawResolve;
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

  undo() {
    if (this._historyMoves.length < 1) return false;

    const lastMove = this._historyMoves.pop();
    if (!lastMove) return false;

    const lastMovedPiece = this._getPieceAt(lastMove.endPosition);
    if (!lastMovedPiece) return false;

    lastMovedPiece.position.set(lastMove.startPosition);

    if (lastMove.type === MoveType.Capture) {
      const capturedPiece = this._capturedPieces.pop();
      if (!capturedPiece) return false;

      this._pieces.push(capturedPiece);
    } else if (lastMove.type === MoveType.Castling) {
      const rook = this._getPieceAt(lastMove.castlingRookEndPosition);
      if (!rook) return false;

      rook.position.set(lastMove.castlingRookStartPosition);
    } else if (lastMove.type === MoveType.Promotion) {
      const pawn = this._promotedPawns.pop();
      if (!pawn) return false;

      pawn.position.set(lastMove.startPosition);
      this._pieces.push(pawn);
    }

    const previousMove = this._historyMoves.at(-1);
    const previousMovedPiece =
      (previousMove && this._getPieceAt(previousMove.endPosition)) ?? null;

    this.handleBoardChange(previousMovedPiece);

    return true;
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

  private hasPieceLegalMoves(
    piece: MutablePiece,
    options?: MoveValidationOptions,
  ) {
    const positions = piece.getPossibleMoves();
    return positions.some((position) =>
      this.isMoveValid(piece, position, options),
    );
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

    let mutableMove = this.validateMove(piece, endPosition);
    if (!mutableMove) return unsuccessfulMove;

    const isIrreversibleMove =
      ((piece.type === Type.King || piece.type === Type.Rook) &&
        !piece.isMoved) ||
      piece.type === Type.Pawn;

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

    this._historyMoves.push(mutableMove);

    if (isIrreversibleMove) this._positionHashes.length = 0;
    this.hashPositions();

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

    this._promotedPawns.push(piece);
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
    const isCheck = status === Status.Check;
    const isCheckmate = status === Status.Checkmate;
    const isDraw = status === Status.Draw;

    if (isCheck) {
      this._checkColor = king.color;
      this.onCheck?.(king.color);
    } else if (this._checkColor === king.color) {
      this._checkColor = null;
      this.onCheckResolve?.();
    }
    if (isCheckmate) {
      this._checkmateColor = king.color;
      this._checkColor = king.color;
      this.onCheckmate?.(king.color);
    } else if (this._checkmateColor === king.color) {
      this._checkmateColor = null;
      this._checkColor = null;
      this.onCheckmateResolve?.();
    }
    if (isDraw) {
      this._isDraw = true;
      this.onDraw?.();
    } else {
      this._isDraw = false;
      this.onDrawResolve?.();
    }
  }

  private isMoveValid(...args: Parameters<typeof this.validateMove>) {
    return !!this.validateMove(...args);
  }

  private validateMove(
    piece: MutablePiece,
    endPosition: MutablePosition,
    options?: MoveValidationOptions,
  ): MutableMoveT | undefined {
    if (
      (this._checkmateColor && !options?.ignoreCheckmate) ||
      (this._isDraw && !options?.ignoreDraw)
    )
      return undefined;

    const isTurnRight =
      options?.ignoreTurn || piece.color === this._currentTurnColor;
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

    const isThreefoldRepetitionDraw = this.checkThreefoldRepetitionDraw();
    if (isThreefoldRepetitionDraw) return Status.Draw;

    const teamPieces = this._getPiecesByColor(king.color);
    for (const piece of teamPieces) {
      const hasLegalMoves = this.hasPieceLegalMoves(piece, {
        ignoreDraw: true,
        ignoreCheckmate: true,
      });
      if (hasLegalMoves) {
        return undefined;
      }
    }

    return Status.Draw;
  }

  private checkThreefoldRepetitionDraw() {
    const lastMovedPiece = this._lastMovedPiece;
    if (lastMovedPiece) {
      const lastMovedPiecePosition = lastMovedPiece.position;
      const lastMovedPieceId = lastMovedPiece.id;

      if (this._positionHashes.length >= 10) {
        const repeatedMoves = this._historyMoves.filter(
          (move) =>
            move.pieceId === lastMovedPieceId &&
            move.endPosition.distanceTo(lastMovedPiecePosition) === 0,
        );

        if (repeatedMoves.length >= 3) {
          const latestPostionHash = this._positionHashes.at(-1)!;
          const repeatedPositions = this._positionHashes.filter(
            (positionHash) => positionHash === latestPostionHash,
          );

          if (repeatedPositions.length >= 3) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private isKingInCheck(...args: Parameters<typeof this.piecesCheckingKing>) {
    return this.piecesCheckingKing(...args).length > 0;
  }

  private piecesCheckingKing(
    king: King,
    ignorePiece: MutablePiece | undefined,
  ) {
    const enemies = this._getPiecesByColor(king.oppositeColor);
    return enemies.filter(
      (enemy) =>
        this.isMoveValid(enemy, king.position, { ignoreTurn: true }) &&
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

  private hashPositions() {
    const positionsHash = hashPositions(this._pieces);
    this._positionHashes.push(positionsHash);
  }

  private _checkColor: Color | null = null;
  private _checkmateColor: Color | null = null;
  private _isDraw: boolean = false;
  private _pieces: Array<MutablePiece>;
  private _currentTurnColor: Color = Color.White;
  private _lastMovedPiece: MutablePiece | null = null;
  private _historyMoves: Array<MutableMoveT> = [];
  private _capturedPieces: Array<MutablePiece> = [];
  private _promotedPawns: Array<MutablePiece> = [];
  private _positionHashes: Array<string> = [];

  private getPromotionVariant: EventHandlerT["GetPromotionVariant"] | undefined;
  private onBoardChange: EventHandlerT["BoardChange"] | undefined;
  private onCheck: EventHandlerT["Check"] | undefined;
  private onCheckmate: EventHandlerT["Checkmate"] | undefined;
  private onDraw: EventHandlerT["Draw"] | undefined;
  private onCheckResolve: EventHandlerT["CheckResolve"] | undefined;
  private onCheckmateResolve: EventHandlerT["CheckResolve"] | undefined;
  private onDrawResolve: EventHandlerT["DrawResolve"] | undefined;
  private onMove: EventHandlerT["Move"] | undefined;
  private onCapture: EventHandlerT["Capture"] | undefined;
  private onCastling: EventHandlerT["Castling"] | undefined;
  private onPromotion: EventHandlerT["Promotion"] | undefined;
}

// FIXME: threefold repetition
// TODO: clear positions hash history when a non-reversible event happens
