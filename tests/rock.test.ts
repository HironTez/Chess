import { expect, test } from "bun:test";
import { Color, CustomBoard, King, Pawn, Position, Rook } from "../src";

test("rook possible positions", () => {
  const board = new CustomBoard([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rook("D4", Color.White),
    new Pawn("E4", Color.Black),
  ]);

  const rook = board.getPieceAt("D4")!;
  expect(rook).toBeDefined();
  const possibleMoves = rook.getPossibleMoves();
  expect(possibleMoves).not.toBeEmpty();
  const { x, y } = rook.position;

  const expectedPositions: Position[] = [];
  for (let i = 0; i <= 7; i++) {
    if (i !== x) {
      expectedPositions.push(
        new Position({ x: i, y }),
        new Position({ x, y: i }),
      );
    }
  }

  for (const position of expectedPositions) {
    const matchedMove = possibleMoves.find(
      (possibleMove) => possibleMove.distanceTo(position) === 0,
    );

    expect(matchedMove).not.toBeUndefined();
  }
});
