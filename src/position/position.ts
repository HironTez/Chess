import { isInLimit } from "../helpers";
import {
  decodePositionNotation,
  encodePositionNotation,
  getDiff,
} from "./helpers";

export type PointT = {
  x: number;
  y: number;
};

export type PositionInputT = Position | PointT | string;

export class Position {
  constructor(position: PositionInputT) {
    this._set(position);
  }

  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  get notation() {
    return this._notation;
  }
  get isValid() {
    return this._isValid;
  }

  distanceTo(positionInput: PositionInputT) {
    const position =
      typeof positionInput === "string"
        ? new Position(positionInput)
        : positionInput;

    const { xDiff, yDiff } = getDiff(this, position);
    return Math.max(Math.abs(xDiff), Math.abs(yDiff));
  }

  protected _set(position: PositionInputT) {
    if (typeof position === "string") {
      const { x, y } = decodePositionNotation(position);

      this._x = x ?? NaN;
      this._y = y ?? NaN;
    } else {
      this._x = position.x;
      this._y = position.y;
    }

    this._isValid =
      typeof this._x === "number" &&
      typeof this._y === "number" &&
      isInLimit(0, this._x, 7) &&
      isInLimit(0, this._y, 7);

    this._notation = this._isValid
      ? encodePositionNotation(this._x, this._y)
      : undefined;
  }

  protected _x = NaN;
  protected _y = NaN;
  protected _notation: string | undefined = undefined;
  protected _isValid = false;
}

export class MutablePosition extends Position {
  constructor(position: PositionInputT) {
    super(position);
  }

  set(position: PositionInputT) {
    this._set(position);
  }
}
