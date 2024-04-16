import { expect, test } from "bun:test";
import { Board } from "../board";
import { Color, King, Pawn, Rock } from "../pieces";
import { Position } from "../position/position";

test("rock possible positions", () => {
  const board = new Board([
    new King("E1", Color.White),
    new King("E8", Color.Black),
    new Rock("D4", Color.White),
    new Pawn("E4", Color.Black),
  ]);

  const rock = board.getPieceAt("D4")!;
  expect(rock).toBeDefined();
  const possibleMoves = rock.getPossibleMoves();
  expect(possibleMoves).not.toBeEmpty();
  const { x, y } = rock.position.get();

  const expectedPositions = [];
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
