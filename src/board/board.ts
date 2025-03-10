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
import {
  dedupePositionsList,
  evaluatePiece,
  hashPositions,
  predicateNullable,
  sortPiecesByPower,
} from "./helpers";

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
  isPieceFirstMove: boolean;
} & (
  | { type: MoveType.Move }
  | { type: MoveType.Capture; capturedPosition: T }
  | {
      type: MoveType.Castling;
      castlingRookStartPosition: T;
      castlingRookEndPosition: T;
    }
  | { type: MoveType.Promotion; newPieceType: PromotionTypeT }
);

export type MoveT = DynamicMoveT<Position>;
type MutableMoveT = DynamicMoveT<MutablePosition>;

export type MoveReturnT =
  | { success: false; reason: string }
  | ({ success: true } & MoveT);

export type UndoReturnT =
  | { success: true }
  | { success: false; reason: string };

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

export enum Status {
  Active = "active",
  Check = "check",
  Checkmate = "checkmate",
  Draw = "draw",
}

type MoveOptions = { silent: boolean };
type MoveValidationOptions = {
  ignoreTurn?: boolean;
  ignoreCheckmate?: boolean;
  ignoreDraw?: boolean;
};

export type BoardOptionsT = {
  colorToMove?: Color;
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

const unsuccess = (reason: string) => ({ success: false, reason }) as const;

/**
 * Chess board with a custom set of pieces
 * @param {MutablePiece[]} pieces - A set of mutable chess pieces to initialize the board.
 * @param {BoardOptionsT} [options] - Board options to customize behavior.
 * @param {Color} [colorToMove] - Color of the team that makes the first move.
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

    if (options?.colorToMove) this._colorToMove = options.colorToMove;

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

    this.handleBoardChange(null, false, false);
  }

  get status() {
    return this._status;
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
  get colorToMove() {
    return this._colorToMove;
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

    const mutableMoves = this._getLegalMovesOf(piece);
    return mutableMoves.map(this.makeMoveReadonly);
  }

  async move(
    startPositionInput: PositionInputT,
    endPositionInput: PositionInputT,
  ): Promise<MoveReturnT> {
    const startPosition = new MutablePosition(startPositionInput);
    const endPosition = new MutablePosition(endPositionInput);
    if (!startPosition || !endPosition) return unsuccess("Invalid input");

    return await this.movePiece(startPosition, endPosition);
  }

  undo() {
    return this._undo();
  }

  async evaluate(depth: number = 2) {
    return await this.alphaBeta(depth, true);
  }

  async autoMove(depth: number = 2): Promise<MoveReturnT> {
    let maxScore = -Infinity;
    let startPosition: MutablePosition | null = null;
    let endPosition: MutablePosition | null = null;

    const teamPieces = this._getPiecesByColor(this._colorToMove);
    for (const piece of sortPiecesByPower(teamPieces)) {
      for (const possibleMove of this._getLegalMovesOf(piece)) {
        const move = await this.movePiece(
          piece.position,
          possibleMove.endPosition,
          { silent: true },
        );

        if (!move.success) return move;

        const score = await this.alphaBeta(depth - 1, false);

        if (score >= maxScore) {
          maxScore = score;
          startPosition = piece.position;
          endPosition = possibleMove.endPosition;
        }

        const undo = this._undo({ silent: true });
        if (!undo.success)
          return unsuccess(
            `Internal: Could not undo (move ${move.startPosition.notation}-${move.endPosition.notation}). Reason: ${undo.reason}`,
          );
      }
    }

    if (startPosition && endPosition) {
      return await this.movePiece(startPosition, endPosition);
    }

    return unsuccess(
      `Internal: Invalid positions (${startPosition?.notation}-${endPosition?.notation})`,
    );
  }

  private _undo(options?: MoveOptions): UndoReturnT {
    const lastMove = this._historyMoves.pop();
    if (!lastMove) return unsuccess("No moves to undo");

    const lastMovedPiece = this._getPieceAt(lastMove.endPosition);
    if (!lastMovedPiece)
      return unsuccess("Could not find the last moved piece");

    lastMovedPiece.position.set(lastMove.startPosition);

    if (lastMove.type === MoveType.Capture) {
      const capturedPiece = this._capturedPieces.pop();
      if (!capturedPiece)
        return unsuccess("Could not restore the captured piece");

      this._pieces.push(capturedPiece);
    } else if (lastMove.type === MoveType.Castling) {
      const rook = this._getPieceAt(lastMove.castlingRookEndPosition);
      if (!rook) return unsuccess("Could not find the castling rook");

      rook.position.set(lastMove.castlingRookStartPosition);
    } else if (lastMove.type === MoveType.Promotion) {
      const pawn = this._promotedPawns.pop();
      if (!pawn) return unsuccess("Could not restore the promoted pawn");

      pawn.position.set(lastMove.startPosition);
      this._pieces.push(pawn);
    }

    if (lastMove.isPieceFirstMove) {
      lastMovedPiece.setIsMoved(false);
    }

    const previousMove = this._historyMoves.at(-1);
    const previousMovedPiece =
      (previousMove && this._getPieceAt(previousMove.endPosition)) ?? null;

    if (this.checkmateColor) {
      this._checkmateColor = null;
      this._checkColor = null;
      if (!options?.silent) this.onCheckmateResolve?.();
    } else if (this._checkColor) {
      this._checkColor = null;
      if (!options?.silent) this.onCheckResolve?.();
    } else if (this._isDraw === true) {
      this._isDraw = false;
      if (!options?.silent) this.onDrawResolve?.();
    }

    this.handleBoardChange(previousMovedPiece, options?.silent);

    return { success: true };
  }

  private _getPieceAt(positionInput: PositionInputT) {
    const position = new MutablePosition(positionInput);
    if (!position) return undefined;

    return this._pieces.find((piece) => piece.isAt(position));
  }

  private _getPiecesByColor(color: Color) {
    return this._pieces.filter((piece) => piece.color === color);
  }

  private _getLegalMovesOf(
    piece: MutablePiece,
    options?: MoveValidationOptions,
  ) {
    const positions = piece.getPotentialMoves();
    return positions
      .map((position) => this.validateMove(piece, position, options))
      .filter(predicateNullable);
  }

  private hasPieceLegalMoves(
    piece: MutablePiece,
    options?: MoveValidationOptions,
  ) {
    const positions = piece.getPotentialMoves();
    return positions.some((position) =>
      this.isMoveValid(piece, position, options),
    );
  }

  private makeMoveReadonly<T extends MutableMoveT>(mutableMove: T): MoveT {
    const move: Record<string, unknown> = { ...mutableMove };
    for (const keyName in move) {
      const key = keyName;
      if (move[key] instanceof MutablePosition) {
        Object.assign(move, { [key]: new Position(move[key]) });
      }
    }

    return move as MoveT;
  }

  private async movePiece(
    startPosition: MutablePosition,
    endPosition: MutablePosition,
    options?: MoveOptions,
  ): Promise<MoveReturnT> {
    const piece = this._getPieceAt(startPosition);
    if (!piece)
      return unsuccess(`Could not find piece at ${startPosition.notation}`);

    let mutableMove = this.validateMove(piece, endPosition);
    if (!mutableMove)
      return unsuccess(
        `Move is not valid (${startPosition.notation}-${endPosition.notation})`,
      );

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
        options?.silent,
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
          ? (this._getPieceAt(mutableMove.capturedPosition) ?? null)
          : null;

      this.handleMovePiece(
        piece,
        mutableMove.endPosition,
        pieceToCapture,
        options?.silent,
      );

      if (this.isPromotionPossible(piece)) {
        const pieceType = await this.handlePromotePawn(piece, options?.silent);

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

    this.handleBoardChange(piece, options?.silent);

    return { success: true, ...this.makeMoveReadonly(mutableMove) };
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
    silent: boolean | undefined,
  ) {
    const readonlyPieceStartPosition = new Position(piece.position);
    const readonlyPieceEndPosition = new Position(endPosition);

    if (pieceToCapture) {
      this._capturedPieces.push(pieceToCapture);
      this.removePiece(pieceToCapture);
    }

    piece.move(endPosition);

    if (!silent) {
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
  }

  private async handlePromotePawn(
    piece: MutablePiece,
    silent: boolean | undefined,
  ) {
    const readonlyPiecePosition = new Position(piece.position);

    const pieceTypeInput = !silent
      ? await this.getPromotionVariant?.(readonlyPiecePosition)
      : undefined;
    const pieceType = pieceTypeInput ?? Type.Queen;
    const pieceClass = getPieceClassByTypename(pieceType);

    this._promotedPawns.push(piece);
    this.removePiece(piece);
    this._pieces.push(new pieceClass(piece.position, piece.color));

    if (!silent) {
      this.onPromotion?.(readonlyPiecePosition, pieceType);
    }

    return pieceType;
  }

  private handleCastle(
    king: MutablePiece,
    kingEndPosition: MutablePosition,
    rookStartPosition: MutablePosition,
    rookEndPosition: MutablePosition,
    silent: boolean | undefined,
  ) {
    const readonlyKingStartPosition = new Position(king.position);
    const readonlyKingEndPosition = new Position(kingEndPosition);
    const readonlyRookStartPosition = new Position(rookStartPosition);
    const readonlyRookEndPosition = new Position(rookEndPosition);

    const rook = this._getPieceAt(rookStartPosition);

    king.move(kingEndPosition);
    rook?.move(rookEndPosition);

    if (!silent) {
      this.onCastling?.(
        readonlyKingStartPosition,
        readonlyKingEndPosition,
        readonlyRookStartPosition,
        readonlyRookEndPosition,
      );
    }
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
            castlingRookNewPosition: new MutablePosition({ x: newRookPosX, y }),
          };
        }
      }
    }

    return {};
  }

  private handleBoardChange(
    lastMovedPiece: MutablePiece | null,
    silent: boolean | undefined,
    changeColorToMove = true,
  ) {
    if (changeColorToMove) this._colorToMove = invertColor(this._colorToMove);
    this._lastMovedPiece = lastMovedPiece;

    const king = this.getKing(this._colorToMove);
    if (!king) return;

    this.updateStatus(king, silent);

    if (!silent) {
      this.onBoardChange?.(this.pieces);
    }
  }

  private updateStatus(king: King, silent: boolean | undefined) {
    const status = this.getStatus(king);
    this._status = status;

    const isCheck = status === Status.Check;
    const isCheckmate = status === Status.Checkmate;
    const isDraw = status === Status.Draw;

    if (isCheck) {
      this._checkColor = king.color;
      if (!silent) this.onCheck?.(king.color);
    } else if (this._checkColor) {
      this._checkColor = null;
      if (!silent) this.onCheckResolve?.();
    }
    if (isCheckmate) {
      this._checkmateColor = king.color;
      this._checkColor = king.color;
      if (!silent) this.onCheckmate?.(king.color);
    }
    if (isDraw) {
      this._isDraw = true;
      if (!silent) this.onDraw?.();
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
      options?.ignoreTurn || piece.color === this._colorToMove;
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
      isPieceFirstMove: !piece.isMoved,
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
    if (
      canPieceMove &&
      (options?.ignoreCheckmate || !this.willBeCheck(piece, endPosition))
    ) {
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
    const teamPieces = this._getPiecesByColor(king.color);

    const isInCheck = this.isKingInCheck(king, undefined);
    if (isInCheck) {
      const surroundingPositions = getSurroundingPositions(king.position);
      for (const position of surroundingPositions) {
        const canEscape = this.isMoveValid(king, position);
        if (canEscape) {
          return Status.Check;
        }
      }

      for (const piece of sortPiecesByPower(teamPieces)) {
        if (piece === king) continue;
        const canDefendKing = this.canPieceDefendKing(piece);
        if (canDefendKing) {
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

    for (const piece of teamPieces) {
      const hasLegalMoves = this.hasPieceLegalMoves(piece, {
        ignoreDraw: true,
      });
      if (hasLegalMoves) {
        return Status.Active;
      }
    }

    return Status.Draw;
  }

  private getRepeatedPositionsCount() {
    const latestPostionHash = this._positionHashes.at(-1)!;
    const repeatedPositions = this._positionHashes.filter(
      (positionHash) => positionHash === latestPostionHash,
    );

    return repeatedPositions.length;
  }

  private checkThreefoldRepetitionDraw() {
    if (this._positionHashes.length >= 8) {
      return this.getRepeatedPositionsCount() >= 3;
    }

    return 0;
  }

  private isKingInCheck(king: King, ignorePiece: MutablePiece | undefined) {
    const enemies = this._getPiecesByColor(king.oppositeColor);
    return sortPiecesByPower(enemies).some(
      (enemy) =>
        this.isMoveValid(enemy, king.position, {
          ignoreTurn: true,
          ignoreCheckmate: true,
          ignoreDraw: true,
        }) && enemy !== ignorePiece,
    );
  }

  private piecesCheckingKing(
    king: King,
    ignorePiece: MutablePiece | undefined,
  ) {
    const enemies = this._getPiecesByColor(king.oppositeColor);
    return sortPiecesByPower(enemies).filter(
      (enemy) =>
        this.isMoveValid(enemy, king.position, {
          ignoreTurn: true,
          ignoreCheckmate: true,
          ignoreDraw: true,
        }) && enemy !== ignorePiece,
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
        if (!willBeCheck) {
          return true;
        }
      }

      const enemyPath = getPath(enemy.position, king.position);
      for (const position of enemyPath) {
        const canCover = this.isMoveValid(piece, position);
        const willCancelCheck = this.willBeCheck(piece, position);

        if (canCover && !willCancelCheck) {
          return true;
        }
      }
    }

    return false;
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
    const positionsHash = hashPositions(
      this._pieces.toSorted(
        (a, b) => evaluatePiece(b.type) - evaluatePiece(a.type),
      ),
    );
    this._positionHashes.push(positionsHash);
  }

  private async alphaBeta(
    depth: number,
    isMax: boolean,
    max: number = -Infinity,
    min: number = Infinity,
  ) {
    if (depth === 0 || this._checkmateColor || this._isDraw) {
      const value = this.evaluatePositions();
      return isMax ? value : -value;
    }

    const teamPieces = this._getPiecesByColor(this._colorToMove);
    for (const piece of sortPiecesByPower(teamPieces)) {
      for (const move of this._getLegalMovesOf(piece)) {
        await this.movePiece(piece.position, move.endPosition, {
          silent: true,
        });

        const score = await this.alphaBeta(depth - 1, !isMax, max, min);

        this._undo({ silent: true });

        if (isMax) {
          if (score >= min) return min;
          if (score > max) max = score;
        } else {
          if (score <= max) return max;
          if (score < min) min = score;
        }
      }
    }

    return isMax ? max : min;
  }

  private evaluatePositions() {
    if (this._checkmateColor === this._colorToMove) return -Infinity;
    if (this._checkmateColor === invertColor(this._colorToMove))
      return Infinity;
    if (this._isDraw) return 0;

    const materialWeight = 1;
    const mobilityWeight = 0.001;
    const positioningWeight = 0.001;
    const repeatingPenalty = 4;

    const currentTeamScore = this.evaluateTeam(
      this._colorToMove,
      materialWeight,
      mobilityWeight,
      positioningWeight,
      repeatingPenalty,
    );
    const opponentTeamScore = this.evaluateTeam(
      invertColor(this._colorToMove),
      materialWeight,
      mobilityWeight,
      positioningWeight,
      repeatingPenalty,
    );

    return currentTeamScore - opponentTeamScore;
  }

  private evaluateTeam(
    color: Color,
    materialWeight: number,
    mobilityWeight: number,
    positioningWeight: number,
    repeatingPenalty: number,
  ) {
    const enemyKing = this.getKing(invertColor(color));

    const teamPieces = this._getPiecesByColor(color);
    const teamMaterialScore = teamPieces.reduce(
      (score, piece) => score + evaluatePiece(piece.type),
      0,
    );
    const teamLegalMoves = teamPieces.reduce<MutablePosition[]>(
      (positions, piece) => {
        const pieceLegalMoves = this._getLegalMovesOf(piece, {
          ignoreTurn: true,
        });
        const pieceLegalMovePositions = pieceLegalMoves.map(
          (move) => move.endPosition,
        );
        return dedupePositionsList(positions.concat(pieceLegalMovePositions));
      },
      [],
    );
    const teamMobilityScore = teamLegalMoves.length;
    const teamPositioningScore = teamLegalMoves.reduce((score, position) => {
      const distanceToEnemyKing = enemyKing
        ? position.distanceTo(enemyKing.position)
        : 0;
      const distanceToCenter = position.distanceTo({ x: 3.5, y: 3.5 }) - 0.5;
      return score + (8 - distanceToEnemyKing) + (3 - distanceToCenter);
    }, 0);

    const repeatingCount = this.getRepeatedPositionsCount();

    const score =
      teamMaterialScore * materialWeight +
      teamMobilityScore * mobilityWeight +
      teamPositioningScore * positioningWeight;

    const penalty = repeatingCount * repeatingPenalty;

    return score - penalty;
  }

  private _status = Status.Active;
  private _checkColor: Color | null = null;
  private _checkmateColor: Color | null = null;
  private _isDraw: boolean = false;
  private _pieces: Array<MutablePiece>;
  private _colorToMove: Color = Color.White;
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

// TODO: FEN starting position input
// TODO: transposition hash
// TODO: process unexpected errors handling (in autoMove and alphaBeta methods)
// TODO: more informative results from undo method
