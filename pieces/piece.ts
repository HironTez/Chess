import { PointT, Position } from "../position/position";

export enum Color {
  White = "white",
  Black = "black",
}

export enum Type {
  Pawn = "pawn",
  Rock = "rock",
  Bishop = "bishop",
  Queen = "queen",
  King = "king",
}

export abstract class Piece {
  constructor(position: Position | PointT, color: Color) {
    this.position = Position.isPosition(position)
      ? position
      : new Position(position);
    this.color = color;
    this.oppositeColor = this.color === Color.White ? Color.Black : Color.White;
  }

  move(position: Position) {
    this.position.set(position);
    this.moved = true;
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

  protected moved: boolean = false;
  readonly position: Position;
  readonly color: Color;
  readonly type: Type;
  readonly oppositeColor: Color;
}
