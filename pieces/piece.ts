import { Position } from "../position/position";

export enum Color {
  White,
  Black,
}

export enum Type {
  Pawn,
  Rock,
  Bishop,
  Queen,
  King,
}

export abstract class Piece {
  constructor(position: Position, color: Color) {
    this.position = position;
    this.color = color;
    this.oppositeColor = this.color === Color.White ? Color.Black : Color.White;
  }

  move(position: Position) {
    this.position.set(position);
  }

  isAt(position: Position) {
    const thisPoint = this.position.get();
    const point = position.get();
    return thisPoint.x === point.x && thisPoint.y === point.y;
  }

  abstract canMove(position: Position): boolean;

  canCapture(position: Position) {
    return this.canMove(position);
  }

  readonly position: Position;
  readonly color: Color;
  readonly type: Type;
  readonly oppositeColor: Color;
}
