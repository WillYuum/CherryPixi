import { Component } from "@willyuum/pixi-gameobject-system";
import { ReelRender } from "./ReelRender";
import { SymbolTypeResult } from "./types";

/*
    This class is responsible for rendering win animations.
    It takes in a Map of win info and iterates through each cell position
    and triggers the win animation for each symbol.
*/
export class SymbolOutcomeVisualizer extends Component {
    private reelRender: ReelRender;

    public onPresentWinComplete?: () => void;


    onAwake(): void {
        this.reelRender = this.gameObject.getComponent(ReelRender);
    }

    public renderWin(winInfo: Map<string, SymbolTypeResult>): void {
        if (winInfo.size === 0) return;

        const orderedFromTopToBottom = Array.from(winInfo)
            .flatMap(([_, value]) => value.cellPositions)
            .sort((a, b) => a.column - b.column || a.row - b.row);

        const delay = 0.05;

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

    public renderLoss(lossInfo: Map<string, SymbolTypeResult>): void {
        if (lossInfo.size === 0) return;

        const allLosingSyms = Array.from(lossInfo).map(([key, value]) => value.cellPositions).flat();

        allLosingSyms.forEach(cell => {
            this.reelRender.GetSymbolFromCellPosition(cell).presentLoseAnimation();
        });

    }
}