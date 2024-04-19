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

export class Position {
  static isPosition(position: unknown): position is MutablePosition {
    return position instanceof Position;
  }

  constructor(position: PositionInput | string) {
    this._set(position);
  }

  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  get isValid() {
    return this._isValid;
  }

  distanceTo(positionInput: PointT | MutablePosition) {
    const position = MutablePosition.isPosition(positionInput)
      ? positionInput
      : new MutablePosition(positionInput);

    const { xDiff, yDiff } = getDiff(this, position);
    return Math.max(Math.abs(xDiff), Math.abs(yDiff));
  }

  protected _set(position: PositionInput | string) {
    if (MutablePosition.isPosition(position)) {
      this._x = position.x;
      this._y = position.y;
    } else if (typeof position === "string") {
      const xChar = position.charCodeAt(0);
      const yChar = position.charCodeAt(1);
      const x = xChar >= 97 ? xChar - 97 : xChar - 65;
      const y = yChar - 49;

      if (isInLimit(0, x, 7) && isInLimit(0, y, 7)) {
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

    this._isValid =
      Number.isInteger(this._x) &&
      Number.isInteger(this._y) &&
      isInLimit(0, this._x, 7) &&
      isInLimit(0, this._y, 7);
  }

  protected _x = NaN;
  protected _y = NaN;
  protected _isValid = false;
}

export class MutablePosition extends Position {
  constructor(position: PositionInput | string) {
    super(position);
  }

  set(position: PositionInput | string) {
    this._set(position);
  }
}
