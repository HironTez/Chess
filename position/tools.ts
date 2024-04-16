import { arrayConstructor, isInLimit } from "../tools";
import { Position } from "./position";

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
  position2: Position,
) => {
  const { xDiff, yDiff } = getDiff(position1, position2);
  return Math.abs(xDiff) === Math.abs(yDiff);
};

export const areAlignedVertically = (
  position1: Position,
  position2: Position,
) => {
  const { yDiff } = getDiff(position1, position2);
  return yDiff === 0;
};

export const areAlignedHorizontally = (
  position1: Position,
  position2: Position,
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
            ? position1.get().x + (xDiff > 0 ? i + 1 : -i - 1)
            : position1.get().x,
          y: yDiff
            ? position1.get().y + (yDiff > 0 ? i + 1 : -i - 1)
            : position1.get().y,
        }),
    );
  }
  return [];
};

export const getSurroundingPositions = (position: Position) => {
  const point = position.get();

  const surroundingPositions: Position[] = [];

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;

      const x = point.x + i;
      const y = point.y + j;
      if (!isInLimit(0, x, 7) || !isInLimit(0, y, 7)) continue;

      surroundingPositions.push(new Position({ x: x, y: y }));
    }
  }

  return surroundingPositions;
};
