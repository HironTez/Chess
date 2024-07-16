import { Color, MutablePiece, Type } from "src/pieces";
import { MutablePosition } from "src/position";

const hashPiece = (piece: MutablePiece) => {
  const typeLetter = piece.type === Type.Knight ? "n" : piece.type[0];
  const pieceTypeNotation =
    piece.color === Color.White ? typeLetter.toUpperCase() : typeLetter;

  return `${pieceTypeNotation}${piece.position.x}${piece.position.y}`;
};

export const hashPositions = (pieces: MutablePiece[]) => {
  return pieces.reduce<string>(
    (accumulator, piece) => accumulator.concat(hashPiece(piece)),
    "",
  );
};

export const evaluatePiece = (pieceType: Type) => {
  switch (pieceType) {
    case Type.King:
      return 200;
    case Type.Queen:
      return 9;
    case Type.Rook:
      return 5;
    case Type.Bishop:
      return 3;
    case Type.Knight:
      return 3;
    case Type.Pawn:
      return 1;
  }
};

const evaluatePiecePower = (pieceType: Type) => {
  switch (pieceType) {
    case Type.Queen:
      return 9;
    case Type.Rook:
      return 5;
    case Type.Bishop:
      return 3;
    case Type.Knight:
      return 3;
    case Type.King:
      return 2;
    case Type.Pawn:
      return 1;
  }
};

export const sortPiecesByPower = (pieces: MutablePiece[]): MutablePiece[] => {
  return pieces.sort(
    (a, b) => evaluatePiecePower(b.type) - evaluatePiecePower(a.type),
  );
};

export const dedupePositionsList = (
  positions: MutablePosition[],
): MutablePosition[] => {
  return positions.filter((position, i, self) => {
    const pos = self.find((p) => p.distanceTo(position) === 0);
    return pos ? pos === position : false;
  });
};
