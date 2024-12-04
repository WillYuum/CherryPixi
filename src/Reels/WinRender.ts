import { Component } from "../GameObjectSystem/GameObjectSystem";
import { ReelRender } from "./ReelRender";
import { SymTypeWinInfo } from "./types";

export class WinRender extends Component {
    private reelRender: ReelRender;

    constructor() {
        super();

        setTimeout(() => {
            this.reelRender = this.gameObject.getComponent(ReelRender);
        }, 1000);
    }

    public renderWin(winInfo: Map<string, SymTypeWinInfo>): void {
        if (winInfo.size === 0) return;
        console.log('Showing Wins', winInfo);

        const allWinningSyms = Array.from(winInfo).map(([key, value]) => value.cellPositions).flat();

        allWinningSyms.forEach(cell => {
            this.reelRender.GetSymbolFromCellPosition(cell).sprite.alpha = 1.0;
        });

    }

    public renderLoss(lossInfo: Map<string, SymTypeWinInfo>): void {
        if (lossInfo.size === 0) return;

        console.log("Showing Losses", lossInfo);


        const allLosingSyms = Array.from(lossInfo).map(([key, value]) => value.cellPositions).flat();

        allLosingSyms.forEach(cell => {
            this.reelRender.GetSymbolFromCellPosition(cell).sprite.alpha = 0.5;
        });

    }
}