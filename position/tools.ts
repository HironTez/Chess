import { Position, AxisValue } from "./position";
import { arrayConstructor } from "../tools";

export const getDiff = (position1: Position, position2: Position) => {
  const point1 = position1.get();
  const point2 = position2.get();
  const xDiff = point2.x - point1.x;
  const yDiff = point2.y - point1.y;
  return {
    xDiff,
    yDiff,
  };
};

export const areAlignedDiagonally = (
  position1: Position,
  position2: Position
) => {
  const { xDiff, yDiff } = getDiff(position1, position2);
  return Math.abs(xDiff) === Math.abs(yDiff);
};

export const areAlignedVertically = (
  position1: Position,
  position2: Position
) => {
  const { yDiff } = getDiff(position1, position2);
  return yDiff === 0;
};

export const areAlignedHorizontally = (
  position1: Position,
  position2: Position
) => {
  const { xDiff } = getDiff(position1, position2);
  return xDiff === 0;
};

export const isMovingUp = (position1: Position, position2: Position) => {
  const { yDiff } = getDiff(position1, position2);
  return yDiff > 0;
};

export const getWay = (position1: Position, position2: Position) => {
  if (
    areAlignedDiagonally(position1, position2) ||
    areAlignedVertically(position1, position2) ||
    areAlignedHorizontally(position1, position2)
  ) {
    const { xDiff, yDiff } = getDiff(position1, position2);
    return arrayConstructor(
      Math.abs(xDiff || yDiff) - 1,
      (i) =>
        new Position({
          x: xDiff
            ? ((xDiff > 0 ? i + 1 : -i - 1) as AxisValue)
            : position1.get().x,
          y: yDiff
            ? ((yDiff > 0 ? i + 1 : -i - 1) as AxisValue)
            : position2.get().y,
        })
    );
  }
  return [];
};
