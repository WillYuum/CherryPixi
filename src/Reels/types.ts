export class SymTypeWinInfo {
    public cellPositions: CellPosition[];
    public isWin: boolean;

    constructor(cellPosition: CellPosition[] = null, isWin: boolean) {
        this.cellPositions = cellPosition;
        this.isWin = isWin;
    }
}

export class CellPosition {
    public reel: number;
    public row: number;

    constructor(reel: number, row: number) {
        this.reel = reel;
        this.row = row;
    }
}
