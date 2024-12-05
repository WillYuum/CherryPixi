import { CellPosition, SymTypeWinInfo } from "./Reels/types";

export class GameLogic {
    private gameMechanic: WinHandler;

    public RecentResult: ResultMap;

    constructor() {
        this.gameMechanic = new WaysToWin();
    }

    public handleWin(result: string[][]): void {
        this.RecentResult = this.gameMechanic.GetResultsMap(result);

        console.log('recent result', this.RecentResult);
    }
}

class ResultMap {
    public WinMap: Map<string, SymTypeWinInfo>;
    public LossMap: Map<string, SymTypeWinInfo>;
}

interface WinHandler {
    GetResultsMap(result: string[][]): ResultMap;
}

enum SymTypes {
    high1 = 'high1',
    high2 = 'high2',
    high3 = 'high3',
    low1 = 'low1',
    low2 = 'low2',
    low3 = 'low3',
    low4 = 'low4',
}

class WaysToWin implements WinHandler {
    public hasWin: Boolean = false;

    constructor() { }

    public GetResultsMap(result: string[][]): ResultMap {

        const winMap = new Map<string, SymTypeWinInfo>();
        const lossMap = new Map<string, SymTypeWinInfo>();

        const typesOfSymbolsInReel = [...new Set(result.flat())];


        for (const sym in SymTypes) {
            const winInfo = this.checkForWinOfSymbol(sym as SymTypes, result);
            const symWinInfo = new SymTypeWinInfo(winInfo.cellPosition, winInfo.isWin);
            if (winInfo.isWin) {
                winMap.set(sym, symWinInfo);
            }
        }

        const winningSyms = Array.from(winMap).map(([key, value]) => value.cellPositions).flat();

        for (let row = 0; row < result.length; row++) {
            const currentRow = result[row];
            for (let col = 0; col < currentRow.length; col++) {
                const isWinningCell = winningSyms.some(cell => cell.reel === col && cell.row === row);
                if (isWinningCell) continue;

                const sym = currentRow[col];

                let lossInfo = lossMap.get(sym);
                if (!lossInfo) {
                    lossInfo = new SymTypeWinInfo([], false);
                    lossMap.set(sym, lossInfo);
                }

                lossInfo.cellPositions.push(new CellPosition(col, row));
            }
        }



        return { WinMap: winMap, LossMap: lossMap };
    }

    private checkForWinOfSymbol(symbol: SymTypes, result: string[][]): { cellPosition: CellPosition[]; isWin: boolean } {
        const cellPositions: CellPosition[] = [];
        let consecutiveWin = 0;

        for (let row = 0; row < result.length; row++) {
            const reel = result[row];
            const matchingPositions: CellPosition[] = [];

            for (let col = 0; col < reel.length; col++) {
                if (reel[col] === symbol) {
                    matchingPositions.push(new CellPosition(col, row));
                }
            }

            // Update consecutive win count or reset if no match
            if (matchingPositions.length > 0) {
                consecutiveWin++;
                cellPositions.push(...matchingPositions);
            } else {
                break;
            }
        }

        const isWin = consecutiveWin >= 3;
        return { cellPosition: cellPositions, isWin };
    }
}
