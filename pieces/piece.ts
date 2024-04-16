import { PointT, Position, PositionInput } from "../position/position";

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

export abstract class Piece {
  constructor(positionInput: PositionInput, color: Color) {
    const position =
      new Position(positionInput) ?? new Position({ x: 0, y: 0 });

    this._position = position;
    this.color = color;
    this.oppositeColor = this.color === Color.White ? Color.Black : Color.White;
  }

  move(position: Position) {
    this.onMove(position);

    this._position.set(position);
    this._moved = true;
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

  isMoved() {
    return this.moved;
  }

  abstract getPossibleMoves(): Position[];

  protected abstract canMove(
    position: Position,
    lastMoved: Piece | null,
    isCastlingPossible: boolean,
  ): boolean;

  protected canCapture(
    position: Position,
    lastMoved: Piece | null,
    target: Piece,
  ): boolean {
    return this.canMove(position, lastMoved, false);
  }

  protected onMove(position: Position) {}

  abstract readonly type: Type;

  protected _moved: boolean = false;
  protected _position: Position;
  readonly color: Color;
  readonly oppositeColor: Color;

  get moved() {
    return this._moved;
  }

  get position() {
    return this._position;
  }
}
