import {
  MutablePosition,
  Position,
  PositionInputT,
  parsePoint,
} from "../position";

export enum Color {
  White = "white",
  Black = "black",
}

export enum Type {
  Pawn = "pawn",
  Rook = "rook",
  Knight = "knight",
  Bishop = "bishop",
  Queen = "queen",
  King = "king",
}

export abstract class ReadonlyPieceAbstract {
  constructor(positionInput: PositionInputT, color: Color) {
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

  isAt(positionInput: PositionInputT) {
    const point = parsePoint(positionInput);
    return this._position.x === point.x && this._position.y === point.y;
  }

  protected onMove(position: MutablePosition) {}

  abstract readonly type: Type;

  protected _isMoved: boolean = false;
  protected _position: MutablePosition;
  readonly color: Color;
  readonly oppositeColor: Color;
}

export abstract class PieceAbstract extends ReadonlyPieceAbstract {
  constructor(positionInput: PositionInputT, color: Color) {
    super(positionInput, color);
  }

  move(position: MutablePosition) {
    this.onMove(position);

    this._position.set(position);
    this._isMoved = true;
  }

  abstract getPossibleMoves(): MutablePosition[];

  abstract canMove(
    position: MutablePosition,
    capture: boolean,
    castle: boolean,
  ): boolean;
}

export abstract class MutablePiece extends PieceAbstract {
  constructor(positionInput: PositionInputT, color: Color) {
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

    this.type = piece.type;
  }

  readonly type: Type;
}
