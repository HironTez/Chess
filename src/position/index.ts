import {
  areAlignedDiagonally,
  areAlignedHorizontally,
  areAlignedVertically,
  getDiff,
  getPath,
  getSurroundingPositions,
  isMovingUp,
} from "./helpers";
import type { PointT, PositionInputT } from "./position";
import { MutablePosition, Position, parsePoint } from "./position";

export {
  MutablePosition,
  Position,
  areAlignedDiagonally,
  areAlignedHorizontally,
  areAlignedVertically,
  getDiff,
  getPath,
  getSurroundingPositions,
  isMovingUp,
  parsePoint,
};

export type { PointT, PositionInputT };
