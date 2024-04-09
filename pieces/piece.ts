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
      Position.parsePosition(positionInput) ?? new Position({ x: 0, y: 0 });

    this.position = position;
    this.color = color;
    this.oppositeColor = this.color === Color.White ? Color.Black : Color.White;
  }

  move(position: Position, pieces: Piece[]) {
    this.onMove(position);

    this.position.set(position);
    this.moved = true;
  }

  isAt(position: Position | PointT) {
    const thisPoint = this.position.get();
    const point = position instanceof Position ? position.get() : position;
    return thisPoint.x === point.x && thisPoint.y === point.y;
  }

  isMoveValid(
    position: Position,
    lastMoved: Piece | null,
    willBeCheck: (piece: Piece, position: Position) => boolean,
    pieces: Piece[]
  ) {
    const target = pieces.find((piece) => piece.isAt(position));
    const targetIsEnemy = target?.color === this.oppositeColor;

    if (target && targetIsEnemy) {
      return this.canCapture(position, lastMoved, target, willBeCheck, pieces);
    } else if (!target) {
      return this.canMove(position, lastMoved, willBeCheck, pieces);
    }

    return false;
  }

  isMoved() {
    return this.moved;
  }

  protected abstract canMove(
    position: Position,
    lastMoved: Piece | null,
    willBeCheck: (piece: Piece, position: Position) => boolean,
    pieces: Piece[]
  ): boolean;

  protected canCapture(
    position: Position,
    lastMoved: Piece | null,
    target: Piece,
    willBeCheck: (piece: Piece, position: Position) => boolean,
    pieces: Piece[]
  ): boolean {
    return this.canMove(position, lastMoved, willBeCheck, pieces);
  }

  protected onMove(position: Position) {}

  public active: boolean = true;

  abstract readonly type: Type;

  protected moved: boolean = false;
  readonly position: Position;
  readonly color: Color;
  readonly oppositeColor: Color;
}
