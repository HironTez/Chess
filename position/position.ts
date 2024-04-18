import { isInLimit } from "../tools";
import { getDiff } from "./tools";

export type PointT = {
  x: number;
  y: number;
};

export type PositionString = `${
  | ("a" | "b" | "c" | "d" | "e" | "f" | "g" | "h")
  | ("A" | "B" | "C" | "D" | "E" | "F" | "G" | "H")}${
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"}`;

export type PositionInput = Position | PointT | PositionString;

export class ReadonlyPosition {
  static isPosition(position: unknown): position is Position {
    return position instanceof Position;
  }

  constructor(position: PositionInput | string) {
    this.set(position);
  }

  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }

  set(position: PositionInput | string) {
    if (Position.isPosition(position)) {
      this._x = position.x;
      this._y = position.y;
    } else if (typeof position === "string") {
      const xChar = position.charCodeAt(0);
      const yChar = position.charCodeAt(1);
      const x = xChar >= 97 ? xChar - 97 : xChar - 65;
      const y = yChar - 49;

      if (isInLimit(0, x, 8) && isInLimit(0, y, 8)) {
        this._x = x;
        this._y = y;
      } else {
        this._x = NaN;
        this._y = NaN;
      }
    } else {
      this._x = position.x;
      this._y = position.y;
    }
  }

  distanceTo(positionInput: PointT | Position) {
    const position = Position.isPosition(positionInput)
      ? positionInput
      : new Position(positionInput);

    const { xDiff, yDiff } = getDiff(this, position);
    return Math.sqrt(xDiff ** 2 + yDiff ** 2);
  }

  chebyshevDistanceTo(positionInput: PointT | Position) {
    const position = Position.isPosition(positionInput)
      ? positionInput
      : new Position(positionInput);

    const { xDiff, yDiff } = getDiff(this, position);
    return Math.max(Math.abs(xDiff), Math.abs(yDiff));
  }

  isValid() {
    return Number.isInteger(this._x) && Number.isInteger(this._y);
  }

  protected _x = NaN;
  protected _y = NaN;
}

export class Position extends ReadonlyPosition {
  constructor(position: PositionInput | string) {
    super(position);
  }

  set(position: PositionInput | string) {
    if (Position.isPosition(position)) {
      this._x = position.x;
      this._y = position.y;
    } else if (typeof position === "string") {
      const xChar = position.charCodeAt(0);
      const yChar = position.charCodeAt(1);
      const x = xChar >= 97 ? xChar - 97 : xChar - 65;
      const y = yChar - 49;

      if (isInLimit(0, x, 8) && isInLimit(0, y, 8)) {
        this._x = x;
        this._y = y;
      } else {
        this._x = NaN;
        this._y = NaN;
      }
    } else {
      this._x = position.x;
      this._y = position.y;
    }
  }
}
