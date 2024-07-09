import { arrayConstructor, isInLimit } from "../helpers";
import { MutablePosition, PointT, Position } from "./position";

/**
 * Get difference between two positions. Values can be negative
 */

export const getDiff = (
  position1: Position | PointT,
  position2: Position | PointT,
) => {
  const xDiff = position2.x - position1.x;
  const yDiff = position2.y - position1.y;
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
  const { xDiff } = getDiff(position1, position2);
  return xDiff === 0;
};

export const areAlignedHorizontally = (
  position1: Position,
  position2: Position,
) => {
  const { yDiff } = getDiff(position1, position2);
  return yDiff === 0;
};

export const isMovingUp = (position1: Position, position2: Position) => {
  const { yDiff } = getDiff(position1, position2);
  return yDiff > 0;
};

export const getPath = (position1: Position, position2: Position) => {
  if (
    areAlignedDiagonally(position1, position2) ||
    areAlignedVertically(position1, position2) ||
    areAlignedHorizontally(position1, position2)
  ) {
    const { xDiff, yDiff } = getDiff(position1, position2);
    return arrayConstructor(
      Math.abs(xDiff || yDiff) - 1,
      (i) =>
        new MutablePosition({
          x: xDiff ? position1.x + (xDiff > 0 ? i + 1 : -i - 1) : position1.x,
          y: yDiff ? position1.y + (yDiff > 0 ? i + 1 : -i - 1) : position1.y,
        }),
    );
  }
  return [];
};

export const getSurroundingPositions = (position: Position) => {
  const surroundingPositions: MutablePosition[] = [];

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;

      const x = position.x + i;
      const y = position.y + j;
      if (!isInLimit(0, x, 7) || !isInLimit(0, y, 7)) continue;

      surroundingPositions.push(new MutablePosition({ x: x, y: y }));
    }
  }

  return surroundingPositions;
};

export const decodePositionNotation = (positionNotation: string) => {
  const xChar = positionNotation.charCodeAt(0);
  const yChar = positionNotation.charCodeAt(1);
  if (isInLimit(49, yChar, 56)) {
    const y = yChar - 49;
    if (isInLimit(65, xChar, 90)) {
      const x = xChar - 65;
      return { x, y };
    }
    if (isInLimit(97, xChar, 122)) {
      const x = xChar - 97;
      return { x, y };
    }
  }

  return { x: undefined, y: undefined };
};

export const encodePositionNotation = (x: number, y: number) => {
  if (isInLimit(0, x, 7) && isInLimit(0, y, 7)) {
    const xChar = x + 65;
    const xString = String.fromCharCode(xChar);
    return `${xString}${y + 1}`;
  }
  return undefined;
};
