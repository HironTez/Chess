import {
  MutablePosition,
  PointT,
  Position,
  PositionInput,
  PositionString,
} from "./position";
import {
  areAlignedDiagonally,
  areAlignedHorizontally,
  areAlignedVertically,
  getDiff,
  getSurroundingPositions,
  getWay,
  isMovingUp,
} from "./tools";

export {
  MutablePosition,
  Position,
  areAlignedDiagonally,
  areAlignedHorizontally,
  areAlignedVertically,
  getDiff,
  getSurroundingPositions,
  getWay,
  isMovingUp,
};

export type { PointT, PositionInput, PositionString };
