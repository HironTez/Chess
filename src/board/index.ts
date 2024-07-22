import type {
  EventHandlerT,
  MoveReturnT,
  MoveT,
  PromotionTypeT,
  UndoReturnT,
} from "./board";
import { CustomBoard, Event, MoveType, Status } from "./board";
import { Board } from "./preparedBoard";

export type { EventHandlerT, MoveReturnT, MoveT, PromotionTypeT, UndoReturnT };

export { Board, CustomBoard, Event, MoveType, Status };
