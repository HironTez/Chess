import { getDiff } from "./tools";

export type AxisValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type PointT = {
  x: AxisValue;
  y: AxisValue;
};

export class Position {
  static isPosition(position: unknown): position is Position {
    return position instanceof Position;
  }

  constructor(point: PointT) {
    this.set(point);
  }

  get() {
    return {
      x: this.x,
      y: this.y,
    };
  }

  set(position: PointT | Position) {
    if (Position.isPosition(position)) {
      const point = position.get();
      this.x = point.x;
      this.y = point.y;
    } else {
      this.x = position.x;
      this.y = position.y;
    }
  }

  distanceTo(position: PointT | Position) {
    if (Position.isPosition(position)) {
      position = position.get();
    }

    return Math.sqrt(this.x * position.x + this.y * position.y);
  }

  chebyshevDistanceTo(position: PointT | Position) {
    if (!Position.isPosition(position)) {
      position = new Position(position);
    }

    const { xDiff, yDiff } = getDiff(this, position);
    return Math.max(xDiff, yDiff);
  }

  private x: AxisValue;
  private y: AxisValue;
}
