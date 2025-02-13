/**
 * Represents the result information for a specific type of symbol in the game.
 * This class identifies whether a symbol type results in a win or loss
 * and stores the positions of the symbols in the grid.
 */
export class SymbolTypeResult {
    public cellPositions: CellPosition[];
    public isWin: boolean;

    constructor(cellPosition: CellPosition[] = null, isWin: boolean) {
        this.cellPositions = cellPosition;
        this.isWin = isWin;
    }
}

export class CellPosition {
    public row: number;
    public column: number;

    constructor(reel: number, row: number) {
        this.row = reel;
        this.column = row;
    }
}
