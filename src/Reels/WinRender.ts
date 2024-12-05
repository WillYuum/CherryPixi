import { Component } from "../GameObjectSystem/GameObjectSystem";
import { ReelRender } from "./ReelRender";
import { SymTypeWinInfo } from "./types";

export class WinRender extends Component {
    private reelRender: ReelRender;

    public onPresentWinComplete?: () => void;


    awake(): void {
        this.reelRender = this.gameObject.getComponent(ReelRender);
    }

    public renderWin(winInfo: Map<string, SymTypeWinInfo>): void {
        if (winInfo.size === 0) return;

        const orderedFromTopToBottom = Array.from(winInfo)
            .flatMap(([_, value]) => value.cellPositions)
            .sort((a, b) => a.y - b.y || a.x - b.x);

        const delay = 0.1;

        const promises: Array<Promise<boolean>> = [];
        for (let i = 0; i < orderedFromTopToBottom.length; i++) {
            const onAnimDone = new Promise<boolean>((resolve) => {
                setTimeout(() => {
                    this.reelRender.GetSymbolFromCellPosition(orderedFromTopToBottom[i]).presentWinAnimation().then(() => {
                        resolve(true);

                    });
                }, i * delay * 1000);
            });
            promises.push(onAnimDone);
        }


        Promise.allSettled(promises).then(() => {
            this.onPresentWinComplete?.();
        });
    }

    public renderLoss(lossInfo: Map<string, SymTypeWinInfo>): void {
        if (lossInfo.size === 0) return;

        const allLosingSyms = Array.from(lossInfo).map(([key, value]) => value.cellPositions).flat();

        allLosingSyms.forEach(cell => {
            this.reelRender.GetSymbolFromCellPosition(cell).presentLoseAnimation();
        });

    }
}