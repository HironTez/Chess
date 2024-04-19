import { Board, CustomBoard } from "./board";
import {
  Bishop,
  Color,
  King,
  Knight,
  Pawn,
  Piece,
  Queen,
  Rock,
  Type,
} from "./pieces";
import type { PointT, PositionInputT, PositionNotationT } from "./position";
import { MutablePosition, Position } from "./position";

export {
  Bishop,
  Board,
  Color,
  CustomBoard,
  King,
  Knight,
  MutablePosition,
  Pawn,
  Piece,
  Position,
  Queen,
  Rock,
  Type,
};
export type { PointT, PositionInputT, PositionNotationT };

// TODO: history of moves
// TODO: undone
// TODO: notations