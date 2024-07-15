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
