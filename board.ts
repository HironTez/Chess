import { Color, King, Piece, Type } from "./pieces";

import { Position } from "./position/position";
import { cloneDeep } from "./tools";
import { getWay } from "./position/tools";

type CheckAction = (king: King) => void;

export class Board {
  constructor(
    pieces: Piece[],
    onCheck: CheckAction,
    onCheckMate: CheckAction,
    onCheckResolve: () => void,
    onBoardChange: (pieces: Piece[]) => void
  ) {
    this.pieces = pieces;
    this.onCheck = onCheck;
    this.onCheckMate = onCheckMate;
    this.onCheckResolve = onCheckResolve;
    this.onBoardChange = onBoardChange;
  }

  movePiece(startPosition: Position, endPosition: Position) {
    const piece = this.pieceAt(startPosition);
    if (piece && this.canPieceMove(piece, endPosition)) {
      this.removePiece(endPosition);
      piece.move(endPosition);

      this.moveEventHandler();
    }
  }

  private moveEventHandler() {
    this.onBoardChange(this.pieces);

    const whiteKing = this.getKing(Color.White);
    const blackKing = this.getKing(Color.Black);
    if (!whiteKing || !blackKing) return;

    const isWhiteKingInCheck = this.isKingInCheck(whiteKing);
    const isBlackKingInCheck = this.isKingInCheck(blackKing);
    const newCheck = isWhiteKingInCheck || isBlackKingInCheck;
    const isWhiteKingInCheckMate = this.isKingInCheckmate(whiteKing);
    const isBlackKingInCheckMate = this.isKingInCheckmate(blackKing);
    const newCheckMate = isWhiteKingInCheckMate || isBlackKingInCheckMate;

    if (this.check !== newCheck) {
      const kingInCheck = isWhiteKingInCheck ? whiteKing : blackKing;
      if (newCheck) this.onCheck(kingInCheck);
      else this.onCheckResolve();

      this.check = newCheck;
    }
    if (this.checkmate !== newCheckMate) {
      const kingInCheckMate = isWhiteKingInCheckMate ? whiteKing : blackKing;
      if (newCheckMate) this.onCheckMate(kingInCheckMate);
    }
  }

  private check: boolean;
  private checkmate: boolean;
  private pieces: Array<Piece>;

  private onCheck: CheckAction;
  private onCheckMate: CheckAction;
  private onCheckResolve: () => void;
  private onBoardChange: (pieces: Array<Piece>) => void;

  private isMoveValid(piece: Piece, position: Position) {
    const target = this.pieceAt(position);
    const moving = !!piece.position.distanceTo(position);
    const canDefendKing = this.canDefendKing(piece);
    const coversKing = this.coversKing(piece, target);

    if (
      !moving ||
      ((this.check || coversKing) && !canDefendKing) ||
      this.checkmate
    )
      return false;

    return this.canPieceMove(piece, position);
  }

  private canPieceMove(piece: Piece, position: Position) {
    const way = getWay(piece.position, position);

    for (const position of way) {
      if (this.pieceAt(position)) return false;
    }

    const target = this.pieceAt(position);
    const targetIsEnemy = target?.color === piece.oppositeColor;
    const canMove = piece.canMove(position);
    const canCapture = piece.canCapture(position);
    console.log(targetIsEnemy);

    return targetIsEnemy ? canCapture : canMove;
  }

  private coversKing(piece: Piece, target: Piece | undefined) {
    const king = this.getKing(piece.color);
    if (!king) return false;

    const enemiesCheckingKing = this.piecesCheckingKing(king);
    for (const enemy of enemiesCheckingKing) {
      if (target && enemy.isAt(target.position)) {
        continue;
      }

      const enemyWayToKing = getWay(enemy.position, king.position);

      for (const position of enemyWayToKing) {
        if (piece.isAt(position)) {
          return true;
        }
      }
    }

    return false;
  }

  private isKingInCheckmate(king: King) {
    const isInCheck = this.isKingInCheck(king);
    if (isInCheck) {
      const team = this.getPiecesByColor(king.color);
      for (const teammate of team) {
        if (this.canDefendKing(teammate)) {
          return false;
        }
      }

      return true;
    }

    return false;
  }

  private isKingInCheck(king: King) {
    return this.piecesCheckingKing(king).length > 0;
  }

  private piecesCheckingKing(king: King) {
    const enemies = this.getPiecesByColor(king.oppositeColor);
    return enemies.filter((enemy) => this.canPieceMove(enemy, king.position));
  }

  private canDefendKing(piece: Piece) {
    const king = this.getKing(piece.color);
    if (!king) return false;

    const enemiesCheckingKing = this.piecesCheckingKing(king);
    for (const enemy of enemiesCheckingKing) {
      const canCaptureEnemy = this.isMoveValid(piece, enemy.position);
      if (canCaptureEnemy) {
        const willCancelCheck = this.isCheckResolvedByMove(
          piece,
          enemy.position
        );
        if (willCancelCheck) {
          return false;
        }
      }

      const enemyWay = getWay(enemy.position, king.position);
      for (const position of enemyWay) {
        const canCover = this.isMoveValid(piece, position);
        const willCancelCheck = this.isCheckResolvedByMove(piece, position);

        if (canCover && willCancelCheck) {
          return false;
        }
      }
    }

    return true;
  }

  private isCheckResolvedByMove(piece: Piece, position: Position): boolean {
    const piecesCopy = cloneDeep(this.pieces);

    piece.move(position);
    this.removePiece(position);

    const king = this.getKing(piece.color);
    const isInCheck = king && this.isKingInCheck(king);

    this.pieces = piecesCopy;

    return !isInCheck;
  }

  private pieceAt(position: Position) {
    return this.pieces.find((piece) => piece.isAt(position));
  }

  private getPiecesByColor(color: Color) {
    return this.pieces.filter((piece) => piece.color === color);
  }

  private getKing(color: Color) {
    return this.pieces.find(
      (piece) => piece.type === Type.King && piece.color === color
    ) as King | undefined;
  }

  private removePiece(position: Position) {
    this.pieces = this.pieces.filter((piece) => !piece.isAt(position));
  }
}
