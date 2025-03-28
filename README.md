# Chess engine

> This is a fully functional game core that implements all the functionality and logic and provides an easy way to interact with the pieces.

## Install

#### npm

`npm i @hiron-tez/chess`

#### pnpm

`pnpm add @hiron-tez/chess`

#### yarn

`yarn add @hiron-tez/chess`

#### bun

`bun add @hiron-tez/chess`

## Usage

### Basic

```js
import { Board } from "@hiron-tez/chess";
const board = new Board();
await board.move("a2", "a4");
await board.autoMove();
await board.undo();
```

### Advanced

```js
import { CustomBoard, King, Pawn } from "@hiron-tez/chess";

const board = new CustomBoard([
  new King("B2", Color.White),
  new King("B8", Color.Black),

  new Pawn("A2", Color.White),
  new Pawn("B4", Color.Black),
]);

const pawnDoubleMove = await board.move("A2", "A4");
// { success: true, ...}
const enPassant = await board.move("B4", "A3");
// { success: true, ...}
const blackPawn = board.getPieceAt("A3");
// [instance of Piece]
const whitePawn = board.getPieceAt("A4");
// undefined
const checkColor = board.checkColor;
// Color.White
const checkmateColor = board.checkmateColor;
// null
const whiteKingPossibleMoves = board.getPossibleMoves("B2");
// [array of MoveT]
const isBlackPawnAtA3 = blackPawn?.isAt("A3");
// true
```

## Documentation

- Notation string

  > String that represents a position on a chess board. Allowed characters: a-h, A-H, 1-8. Format: "[File][Rank]"

  - type: `string`
  - example: `"A1"`

- PointT

  > An object with x and y coordinates. Allowed values: 0-7

  - type: `object`
  - example:

    ```js
    {
      x: 0,
      y: 0
    }
    ```

- PositionInputT

  > PointT, Position or notation string

  - type: `PointT` | `Position` | `string`

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
    - `position` PositionInputT
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
    - `id` string - a unique identifier
  - methods:
    - `isAt` - check if the piece is at specified position
      - params:
        - `position` PositionInputT
      - returns boolean

- King, Queen, Rook, Bishop, Knight, Pawn (extend Piece)

  > Classes that represent chess pieces with their unique behaviors

  - parameters:
    - `position` PositionInputT - the position of the piece
    - `color` Color - the color of the piece

- CustomBoard

  > Chess game controller

  - parameters:
    - `pieces` Array\<King | Queen | Rook | Bishop | Knight | Pawn> - the set of pieces
    - `options.colorToMove` Color (optional) - which team should move first
    - `options.getPromotionVariant` EventHandler["GetPromotionVariant"] (optional)
    - `options.onBoardChange` EventHandler["BoardChange"] (optional)
    - `options.onCheck` EventHandler["Check"] (optional)
    - `options.onCheckmate` EventHandler["Checkmate"] (optional)
    - `options.onDraw` EventHandler["Draw"] (optional)
    - `options.onCheckResolve` EventHandler["CheckResolve"] (optional)
    - `options.onCheckmateResolve` EventHandler["CheckmateResolve"] (optional) (triggers only on undo)
    - `options.onDrawResolve` EventHandler["DrawResolve"] (optional) (triggers only on undo)
    - `options.onMove` EventHandler["Move"] (optional)
    - `options.onCapture` EventHandler["Capture"] (optional)
    - `options.onCastling` EventHandler["Castling"] (optional)
    - `options.onPromotion` EventHandler["Promotion"] (optional)
  - properties:
    - `status` Status - status of the game
    - `checkColor` Color | null - color of the team in check
    - `checkmateColor` Color | null - color of the team in checkmate
    - `isDraw` boolean - did game ended with a draw
    - `winnerColor` Color | null - color of the winner team
    - `colorToMove` Color - color of the team that makes the next move
    - `pieces` Array\<Piece> - the current set of pieces
    - `capturedPieces` Array\<Piece> - the set of captured pieces
    - `history` Array\<MoveT> - the list of moves
  - methods:
    - `move` - move a piece from and to a specified position
      - params:
        - `startPosition` PositionInput
        - `endPosition` PositionInput
      - returns Promise\<MoveReturnT> - move result with details
    - `undo` - undo the latest move
      - returns UndoReturnT
    - `on` - set event handler. Overrides previous handler for the same event
      - params:
        - `event` Event
        - `eventHandler` EventHandler
    - `getPieceAt` - get a piece at the specified position
      - params:
        - `position` PositionInputT
      - returns Piece | undefined
    - `getPiecesByColor` - get all the pieces of a specified team
      - params:
        - `color` Color
      - returns Array\<Piece>
    - `getCapturedPiecesByColor` - get all the captured pieces of a specified team
      - params:
        - `color` Color
      - returns Array\<Piece>
    - `getPossibleMoves` - get all possible moves of a specified piece
      - params:
        - `position` PositionInput
      - returns Array\<MoveT> - list of valid moves
    - `evaluate` - evaluate current positions from the perspective of the current team to move
      - params:
        - `depth` number (optional) (default: 2) - the depth of the forecast
      - returns number - number in range from -Infinity (defeat) to Infinity (win)
    - `autoMove` - move automatically
      - params:
        - `depth` number (optional) (default: 2) - the depth of the forecast
      - returns Promise\<MoveReturnT> - move result with details

- Board (extends CustomBoard)

  > Chess game controller with the prepared set of pieces

  - parameters:
    - `options` - same as in CustomBoard

- Status

  > Enum that represents the current status of the game

  - members:
    - `Active`
    - `Check`
    - `Checkmate`
    - `Draw`

- Event

  > Enum that represents the type of an event

  - members:
    - `BoardChange`
    - `Check`
    - `Checkmate`
    - `Draw`
    - `CheckResolve`
    - `CheckmateResolve`
    - `DrawResolve`
    - `Move`
    - `Capture`
    - `Castling`
    - `Promotion`

- EventHandlerT

  > Event handlers types

  - type: `object`
  - `GetPromotionVariant` - get the promotion variant for a pawn
    - parameters:
      - `position` Position - the position of the pawn
    - returns Type | Promise\<Type>
  - `BoardChange` - board change event handler
    - parameters:
      - `pieces` Array\<Piece> - the current piece set
  - `Check` - check event handler
    - parameters:
      - `color` Color - the color of the team that's in check
  - `Checkmate` - checkmate event handler
    - parameters:
      - `color` Color - the color of the team that's in checkmate
  - `Draw` - draw event handler
  - `CheckResolve` - check resolve event handler
  - `CheckmateResolve` - checkmate resolve event handler. (Triggers only on undo after a checkmate)
  - `DrawResolve` - draw resolve event handler. (Triggers only on undo after a draw)
  - `Move` - piece movement event handler
    - parameters:
      - `startPosition` Position - piece start position
      - `endPosition` Position - piece end position
  - `Capture` - piece capture event handler
    - parameters:
      - `capturedPosition` Position - captured piece position
  - `Castling` - castling event handler
    - parameters:
      - `kingStartPosition` Position - king start position
      - `kingEndPosition` Position - king end position
      - `rookStartPosition` Position - rook start position
      - `rookEndPosition` Position - rook end position
  - `Promotion` - pawn promotion event handler
    - parameters:
      - `position` Position - position of the pawn

- MoveType

  > Enum that represents a type of a move

  - members
    - `Move`
    - `Capture`
    - `Castling`
    - `Promotion`

- MoveT

  > Details of a move

  - type: `object`
  - `type` MoveType - type of the move
  - `startPosition` Position - initial position of the piece
  - `endPosition` Position - final position of the piece
  - `capturedPosition` Position | undefined (exists if `type` is `Capture`) - position of a captured piece. Differs from `endPosition` only on en-passant.
  - `castlingRookStartPosition` Position | undefined (exists if `type` is `Castling`) - initial position of the castling rook
  - `castlingRookEndPosition` Position | undefined (exists if `type` is `Castling`) - final position of the castling rook
  - `newPieceType` Type | undefined (exists if `type` is `Promotion`) - the new piece type of the promoted pawn
  - `pieceId` string - id of the moved piece. Id of a promoted pawn changes
  - `isPieceFirstMove` boolean - indicates whether the piece moved for the first time

- MoveReturnT

  > A wrapper around the `MoveT` that helps to handle successful and unsuccessful moves

  - `success` boolean - whether the move succeeded
  - ...`MoveT` - properties from `MoveT` (exist only if `success` is true)
  - `reason` string - the reason for the failure (exists only if `success` is false)

- UndoReturnT

  > An object that helps to handle successful and unsuccessful undo events

  - `success` boolean - whether the undo was successful
  - `reason` string - the reason for the failure (exists only if `success` is false)
