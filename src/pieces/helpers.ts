import { Bishop } from "./bishop";
import { King } from "./king";
import { Knight } from "./knight";
import { Pawn } from "./pawn";
import { Type } from "./piece";
import { Queen } from "./queen";
import { Rook } from "./rook";

export const getPieceClassByTypename = (type: Type) => {
  switch (type) {
    case Type.Pawn:
      return Pawn;
    case Type.Rook:
      return Rook;
    case Type.Knight:
      return Knight;
    case Type.Bishop:
      return Bishop;
    case Type.Queen:
      return Queen;
    case Type.King:
      return King;
  }
};
