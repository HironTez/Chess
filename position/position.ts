import { isInLimit } from "../tools";
import { getDiff } from "./tools";

export type AxisValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type PointT = {
  x: AxisValue;
  y: AxisValue;
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
  static isPosition(position: unknown): position is Position {
    return position instanceof Position;
  }

  static parsePosition(position: PositionInput | string) {
    if (this.isPosition(position)) {
      return position;
    }

    if (typeof position === "string") {
      const xChar = position.charCodeAt(0);
      const yChar = position.charCodeAt(1);
      const x = xChar >= 97 ? xChar - 97 : xChar - 65;
      const y = yChar - 49;

      if (isInLimit(0, x, 8) && isInLimit(0, y, 8)) {
        return new Position({ x: x as AxisValue, y: y as AxisValue });
      } else {
        return undefined;
      }
    }

    return new Position(position);
  }

  constructor(point: PointT) {
    this.x = point.x;
    this.y = point.y;
  }

  get() {
    return {
      x: this.x,
      y: this.y,
    };
  }

  set(position: PointT | Position) {
    if (Position.isPosition(position)) {
      position = position.get();
    }

    this.x = position.x;
    this.y = position.y;
  }

  distanceTo(position: PointT | Position) {
    if (!Position.isPosition(position)) {
      position = new Position(position);
    }

    const { xDiff, yDiff } = getDiff(this, position);
    return Math.sqrt(xDiff ** 2 + yDiff ** 2);
  }

  chebyshevDistanceTo(position: PointT | Position) {
    if (!Position.isPosition(position)) {
      position = new Position(position);
    }

    const { xDiff, yDiff } = getDiff(this, position);
    return Math.max(Math.abs(xDiff), Math.abs(yDiff));
  }

  private x: AxisValue;
  private y: AxisValue;
}
