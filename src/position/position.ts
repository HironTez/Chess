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

export const parsePoint = (positionInput: PositionInputT) => {
  if (typeof positionInput === "string") {
    const { x, y } = decodePositionNotation(positionInput);
    return { x: x ?? NaN, y: y ?? NaN };
  }

  return { x: positionInput.x, y: positionInput.y };
};

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
    const point = parsePoint(positionInput);
    const { xDiff, yDiff } = getDiff(this, point);
    return Math.max(Math.abs(xDiff), Math.abs(yDiff));
  }

  protected _set(positionInput: PositionInputT) {
    const { x, y } = parsePoint(positionInput);
    this._x = x;
    this._y = y;

    this._isValid = isInLimit(0, this._x, 7) && isInLimit(0, this._y, 7);

    this._notation = encodePositionNotation(this._x, this._y);
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
