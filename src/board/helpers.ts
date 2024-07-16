import { Color, MutablePiece, Type } from "src/pieces";

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
