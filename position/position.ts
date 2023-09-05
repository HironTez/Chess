import { getDiff } from "./tools";

export type PointT = {
  x: number;
  y: number;
};

export class Position {
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
    if (position instanceof Position) {
      const point = position.get();
      this.x = point.x;
      this.y = point.y;
    } else {
      this.x = position.x;
      this.y = position.y;
    }
  }

  distanceTo(position: PointT | Position) {
    if (position instanceof Position) {
      position = position.get();
    }

    return Math.sqrt(this.x * position.x + this.y * position.y);
  }

  chebyshevDistanceTo(position: PointT | Position) {
    if (!(position instanceof Position)) {
      position = new Position(position);
    }

    const { xDiff, yDiff } = getDiff(this, position);
    return Math.max(xDiff, yDiff);
  }

  private x: number;
  private y: number;
}
