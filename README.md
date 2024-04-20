# Chess engine

> This is a fully functional game core that implements all the functionality and logic and provides an easy way to interact with the pieces.

## Install

#### npm

`npm i chess-ht`

#### pnpm

`pnpm add chess-ht`

#### yarn

`yarn add chess-ht`

#### bun

`bun add chess-ht`

## Usage

### Basic

```js
import { Board } from "chess-ht";
const board = new Board();
await board.move("a2", "a4");
```

### Advanced

```js
import { Board, King, Pawn } from "chess-ht";

const board = new CustomBoard([
  new King("B2", Color.White),
  new King("B8", Color.Black),

  new Pawn("A2", Color.White),
  new Pawn("B4", Color.Black),
]);

const pawnDoubleMoved = await board.move("A2", "A4");
// true
const enPassantSuccess = await board.move("B4", "A3");
// true
const capturedPiece = board.getPieceAt("A4");
// undefined
const blackPawn = board.getPieceAt("A3");
// [instance of Piece]
const checkColor = board.check;
// Color.White
const checkmateColor = board.checkmate;
// undefined
const whiteKingPossibleMoves = board.getPossibleMoves("B2");
// [array of Position instances]
const blackPawn?.isAt('A3');
// true
```

## Documentation

- PositionNotationT

  > String that represents a position on a chess board. Allowed characters: a-h, A-H, 1-8.

  - example: `"A1"`

- PointT

  > An object with x and y coordinates. Allowed values: 0-7

  - example:

    ```js
    {
      x: 0,
      y: 0
    }
    ```

- PositionInputT

  > PositionNotationT, PointT or Position

- Type

  > Enum that represents the type of a chess piece.

  - members:
    - `King`
    - `Queen`
    - `Rook`
    - `Bishop`
    - `Knight`
    - `Pawn`

- Color

  > Enum that represents the color of a chess piece.

  - members:
    - `White`
    - `Black`

- Position

  > A class with coordinates and useful methods and properties to work with positions

  - params:
    - `position` PositionInputT | string
  - properties:
    - `x` number - coordinate
    - `y` number - coordinate
    - `notation` string | undefined - a string representation of the position
    - `isValid` boolean - indicates whether the position is valid
  - methods:
    - `distanceTo` - get distance to a specified position
      - params:
        - `position` PositionInputT
      - returns number
      - example:
        ```js
        position.distanceTo("A1");
        ```

- Piece

  > A class representing a chess piece.

  - properties:
    - `type` Type (readonly) - the type of the piece
    - `color` Color (readonly) - the color of the piece
    - `oppositeColor` Color (readonly) - the color of the opposite team
    - `position` Position - the position of the piece
    - `isMoved` boolean - whether the piece was already moved or not yet
  - methods:
    - `isAt` - check if the piece is at specified position
      - params:
        - `position` PositionInputT | string
      - returns boolean

- King, Queen, Rook, Bishop, Knight, Pawn (extend Piece)

  > Classes that represent chess pieces with their unique behaviors

  - parameters:
    - `position` PositionInputT - the position of the piece
    - `color` Color - the color of the piece

- CustomBoard

  > Chess game controller

  - parameters:
    - `pieces` Array<King | Queen | Rook | Bishop | Knight | Pawn> - the set of pieces
    - `options.getPromotionVariant` (optional) - get the promotion variant for a pawn
      - parameters:
        - `position` Position - the position of the pawn
      - returns Type | Promise<Type>
    - `options.onCheck` (optional) - check event handler
      - parameters:
        - `color` Color - the color of the team that's in check
    - `options.onCheckmate` (optional) - checkmate event handler
      - parameters:
        - `color` Color - the color of the team that's in checkmate
    - `options.onCheckResolve` (optional) - check resolve event handler
    - `options.onStalemate` (optional) - stalemate event handler
      - parameters:
        - `color` Color - the color of the team that's in stalemate
    - `options.onBoardChange` (optional) - board change event handler
      - parameters:
        - `pieces` Array<Piece> - the current piece set
    - `options.onMove` (optional) - piece movement event handler
      - parameters:
        - `startPosition` Position - piece start position
        - `endPosition` Position - piece end position
    - `options.onCapture` (optional) - piece capture event handler
      - parameters:
        - `startPosition` Position - piece start position
        - `endPosition` Position - piece end position
        - `capturedPosition` Position - captured target position. It's different from `endPosition` only on en passant because the piece doesn't move to the target's position
    - `options.onCastling` (optional) - castling event handler
      - parameters:
        - `kingStartPosition` Position - king start position
        - `kingEndPosition` Position - king end position
        - `rookStartPosition` Position - rook start position
        - `rookEndPosition` Position - rook end position
    - `options.onPromotion` (optional) - pawn promotion event handler
      - parameters:
        - `position` Position - position of the pawn
  - properties:
    - `check` Color | undefined - color team in check
    - `checkmate` Color | undefined - color team in checkmate
    - `stalemate` Color | undefined - color team in stalemate
    - `pieces` Array<Piece> - the current set of pieces
    - `currentTurn` Color - color of the team to make next move
  - methods:
    - `getPieceAt` - get a piece at the specified position
      - params:
        - `position` PositionInputT
      - returns Piece | undefined
    - `getPiecesByColor` - get all the pieces of a specified team
      - params:
        - `color` Color
      - returns Array<Piece>
    - `getPossibleMoves` - get all possible moves of a specified piece
      - params:
        - `position` PositionInput
      - returns Array<Position> - positions for valid moves
    - `move` - move a piece from and to a specified position
      - params:
        - `startPosition` PositionInput
        - `endPosition` PositionInput
      - returns Promise<boolean> - move success status

- Board (extends CustomBoard)

  > Chess game controller with the prepared set of pieces

  - parameters:
    - `options` - same as in CustomBoard
