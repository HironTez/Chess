import { MutablePosition, PointT, Position, PositionInput } from "../position";

export enum Color {
  White = "white",
  Black = "black",
}

export enum Type {
  Pawn = "pawn",
  Rock = "rock",
  Knight = "knight",
  Bishop = "bishop",
  Queen = "queen",
  King = "king",
}

export abstract class ReadonlyPieceAbstract {
  constructor(positionInput: PositionInput, color: Color) {
    const position = new MutablePosition(positionInput);

    this._position = position;
    this.color = color;
    this.oppositeColor = this.color === Color.White ? Color.Black : Color.White;
  }

  get isMoved() {
    return this._isMoved;
  }
  get position() {
    return new Position(this._position);
  }

  move(position: MutablePosition) {
    this.onMove(position);

    this._position.set(position);
    this._isMoved = true;
  }

  isAt(position: MutablePosition | PointT) {
    return this._position.x === position.x && this._position.y === position.y;
  }

  isMoveValid(
    position: MutablePosition,
    target: MutablePiece | null,
    lastMoved: MutablePiece | null,
    isCastlingPossible: boolean,
  ) {
    const targetIsEnemy = target?.color === this.oppositeColor;

    if (target && targetIsEnemy) {
      return this.canCapture(position, lastMoved, target);
    } else if (!target) {
      return this.canMove(position, lastMoved, isCastlingPossible);
    }

    return false;
  }

  abstract getPossibleMoves(): MutablePosition[];

  abstract canMove(
    position: MutablePosition,
    lastMoved: MutablePiece | null,
    isCastlingPossible: boolean,
  ): boolean;

  canCapture(
    position: MutablePosition,
    lastMoved: MutablePiece | null,
    target: MutablePiece,
  ): boolean {
    return this.canMove(position, lastMoved, false);
  }

  protected onMove(position: MutablePosition) {}

  abstract readonly type: Type;

  protected _isMoved: boolean = false;
  protected _position: MutablePosition;
  readonly color: Color;
  readonly oppositeColor: Color;
}

export abstract class MutablePiece extends ReadonlyPieceAbstract {
  constructor(positionInput: PositionInput, color: Color) {
    super(positionInput, color);
  }

  move(position: MutablePosition) {
    this.onMove(position);

    this._position.set(position);
    this._isMoved = true;
  }

  get position() {
    return this._position;
  }
}

export class Piece extends ReadonlyPieceAbstract {
  constructor(piece: MutablePiece) {
    super(piece.position, piece.color);

    this.canMove = piece.canMove;
    this.canCapture = piece.canCapture;
    this.getPossibleMoves = piece.getPossibleMoves;
    this.type = piece.type;
  }

  canMove: (
    position: MutablePosition,
    lastMoved: MutablePiece | null,
    isCastlingPossible: boolean,
  ) => boolean;

  getPossibleMoves: () => MutablePosition[];
  type: Type;
}
