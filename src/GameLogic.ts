import { CellPosition, SymbolTypeResult } from "./Reels/types";

/**
 * Main goal is to set the game mechanic and us it to handle game results and will be used as
 * an interface to the game renderer.
 */
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

export class ResultMap {
    public WinMap: Map<string, SymbolTypeResult>;
    public LossMap: Map<string, SymbolTypeResult>;
}

interface WinHandler {
    GetResultsMap(result: string[][]): ResultMap;
}

export enum SymTypes {
    high1 = 'high1',
    high2 = 'high2',
    high3 = 'high3',
    low1 = 'low1',
    low2 = 'low2',
    low3 = 'low3',
    low4 = 'low4',
}



/**
 * In the "ways to win" mechanic, a win happens when the same symbol appears
 * in consecutive positions starting from the first three reels. The symbol 
 * must match on each reel and can continue after the third reel.
 */
class WaysToWin implements WinHandler {
    public hasWin: Boolean = false;

    constructor() { }

    public GetResultsMap(result: string[][]): ResultMap {

        const winMap = new Map<string, SymbolTypeResult>();
        const lossMap = new Map<string, SymbolTypeResult>();

        const typesOfSymbolsInReel = [...new Set(result.flat())];


        for (const sym in SymTypes) {
            const symWinInfo = this.GetWayToWinResultOnSymType(sym as SymTypes, result);
            if (symWinInfo.isWin) {
                winMap.set(sym, symWinInfo);
            }
        }

        const winningSyms = Array.from(winMap).map(([key, value]) => value.cellPositions).flat();

        for (let row = 0; row < result.length; row++) {
            const currentRow = result[row];
            for (let col = 0; col < currentRow.length; col++) {
                const isWinningCell = winningSyms.some(cell => cell.x === col && cell.y === row);
                if (isWinningCell) continue;

                const sym = currentRow[col];

                let lossInfo = lossMap.get(sym);
                if (!lossInfo) {
                    lossInfo = new SymbolTypeResult([], false);
                    lossMap.set(sym, lossInfo);
                }

                lossInfo.cellPositions.push(new CellPosition(col, row));
            }
        }



        return { WinMap: winMap, LossMap: lossMap };
    }

    private GetWayToWinResultOnSymType(symType: SymTypes, result: string[][]): SymbolTypeResult {
        const cellPositions: CellPosition[] = [];
        let consecutiveWin = 0;

        for (let row = 0; row < result.length; row++) {
            const reel = result[row];
            const matchingPositions: CellPosition[] = [];

            for (let col = 0; col < reel.length; col++) {
                if (reel[col] === symType) {
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

        return new SymbolTypeResult(cellPositions, isWin);
    }
}
