import {
  PointT,
  Position,
  PositionInput,
  PositionString,
  ReadonlyPosition,
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
  Position,
  ReadonlyPosition,
  areAlignedDiagonally,
  areAlignedHorizontally,
  areAlignedVertically,
  getDiff,
  getSurroundingPositions,
  getWay,
  isMovingUp,
};

export type { PointT, PositionInput, PositionString };
