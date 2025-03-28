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

export const invertColor = (color: Color) => {
  return color === Color.White ? Color.Black : Color.White;
};

export abstract class PieceAbstract {
  constructor(
    positionInput: PositionInputT,
    color: Color,
    id: string | undefined,
  ) {
    const position = new MutablePosition(positionInput);

    this._position = position;
    this.color = color;
    this.oppositeColor = invertColor(this.color);
    this.id = id ?? Math.random().toString(16).slice(2);
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onMove(position: MutablePosition) {}

  abstract readonly type: Type;

  protected _isMoved: boolean = false;
  protected _position: MutablePosition;
  readonly color: Color;
  readonly oppositeColor: Color;
  readonly id: string;
}

export class Piece extends PieceAbstract {
  constructor(piece: MutablePiece) {
    super(new Position(piece.position), piece.color, piece.id);

    this.type = piece.type;
  }

  readonly type: Type;
}

export abstract class MutablePieceAbstract extends PieceAbstract {
  constructor(positionInput: PositionInputT, color: Color) {
    super(positionInput, color, undefined);
  }

  move(position: MutablePosition) {
    this.onMove(position);

    this._position.set(position);
    this._isMoved = true;
  }

  abstract getPotentialMoves(): MutablePosition[];

  abstract canMove(
    position: MutablePosition,
    capture: boolean,
    castle: boolean,
  ): boolean;
}

export abstract class MutablePiece extends MutablePieceAbstract {
  constructor(positionInput: PositionInputT, color: Color) {
    super(positionInput, color);
  }

  get position() {
    return this._position;
  }
  setIsMoved(isMoved: boolean) {
    this._isMoved = isMoved;
  }
}
