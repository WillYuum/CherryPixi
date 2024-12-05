export class SymTypeWinInfo {
    public cellPositions: CellPosition[];
    public isWin: boolean;

    constructor(cellPosition: CellPosition[] = null, isWin: boolean) {
        this.cellPositions = cellPosition;
        this.isWin = isWin;
    }
}

export class CellPosition {
    public x: number;
    public y: number;

    constructor(reel: number, row: number) {
        this.x = reel;
        this.y = row;
    }
}
