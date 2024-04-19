import { PointT, Position, PositionInput, ReadonlyPosition } from "../position";

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
    const position = new Position(positionInput);

    this._position = position;
    this.color = color;
    this.oppositeColor = this.color === Color.White ? Color.Black : Color.White;
  }

  get isMoved() {
    return this._isMoved;
  }
  get position() {
    return new ReadonlyPosition(this._position);
  }

  move(position: Position) {
    this.onMove(position);

    this._position.set(position);
    this._isMoved = true;
  }

  isAt(position: Position | PointT) {
    return this._position.x === position.x && this._position.y === position.y;
  }

  isMoveValid(
    position: Position,
    target: Piece | null,
    lastMoved: Piece | null,
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

  abstract getPossibleMoves(): Position[];

  abstract canMove(
    position: Position,
    lastMoved: Piece | null,
    isCastlingPossible: boolean,
  ): boolean;

  canCapture(
    position: Position,
    lastMoved: Piece | null,
    target: Piece,
  ): boolean {
    return this.canMove(position, lastMoved, false);
  }

  protected onMove(position: Position) {}

  abstract readonly type: Type;

  protected _isMoved: boolean = false;
  protected _position: Position;
  readonly color: Color;
  readonly oppositeColor: Color;
}

export abstract class Piece extends ReadonlyPieceAbstract {
  constructor(positionInput: PositionInput, color: Color) {
    super(positionInput, color);
  }

  move(position: Position) {
    this.onMove(position);

    this._position.set(position);
    this._isMoved = true;
  }

  get position() {
    return this._position;
  }
}

export class ReadonlyPiece extends ReadonlyPieceAbstract {
  constructor(piece: Piece) {
    super(piece.position, piece.color);

    this.canMove = piece.canMove;
    this.canCapture = piece.canCapture;
    this.getPossibleMoves = piece.getPossibleMoves;
    this.type = piece.type;
  }

  canMove: (
    position: Position,
    lastMoved: Piece | null,
    isCastlingPossible: boolean,
  ) => boolean;

  getPossibleMoves: () => Position[];
  type: Type;
}
