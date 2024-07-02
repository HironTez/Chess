import type { PromotionType } from "./board";
import { Board, CustomBoard } from "./board";
import {
  Bishop,
  Color,
  King,
  Knight,
  Pawn,
  Piece,
  Queen,
  Rook,
  Type,
} from "./pieces";
import type { PointT, PositionInputT, PositionNotationT } from "./position";
import { Position } from "./position";

export {
  Bishop,
  Board,
  Color,
  CustomBoard,
  King,
  Knight,
  Pawn,
  Piece,
  Position,
  Queen,
  Rook,
  Type,
};
export type { PointT, PositionInputT, PositionNotationT, PromotionType };

// TODO: history of moves
// TODO: undone
// TODO: notations
