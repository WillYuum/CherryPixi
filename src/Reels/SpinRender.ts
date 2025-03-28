import { SymTypes } from "../GameLogic";
import { Component } from "@willyuum/pixi-gameobject-system";
import { ReelRender } from "./ReelRender";

/**
 * Responsible for visualizing the spinning of the reels with the help of ReelRender
 */
export class SpinRender extends Component {
    spinSpeed: number = 45.0;
    isSpinning: boolean = false;
    isStopping: boolean = false;
    reelRender: ReelRender;

    onSpinComplete?: () => void;

    private spinDuration: number = 2.0; // Total duration of the spin in seconds
    private columnDelayTime: number = 0.5; // Delay time between each column in seconds
    private stopDelayTime: number = 0.5; // Delay time between stopping each reel
    private activeColumns: Set<number> = new Set();
    private stopColumns: Set<number> = new Set();

    private endOutcomeConfig: string[][];

    awake(): void {
        this.reelRender = this.gameObject.getComponent(ReelRender);
    }

    update(dt: number) {
        if (this.isSpinning) this.renderSpin(dt);
        // if (this.isStopping) this.renderStop(dt);
    }

    public StartSpin(endOutcomeConfig: string[][]) {
        if (this.isSpinning) return;

        this.endOutcomeConfig = endOutcomeConfig;
        this.isSpinning = true;
        this.isStopping = false;
        this.activeColumns.clear();
        this.stopColumns.clear();

        const numColumns = this.reelRender.gridSize.width;

        for (let i = 0; i < numColumns; i++) {
            setTimeout(() => {
                this.activeColumns.add(i);
                if (i === numColumns - 1) {
                    setTimeout(() => this.StartStop(), this.spinDuration * 1000);
                }
            }, i * this.columnDelayTime * 1000);
        }
    }

    private StartStop() {
        this.isStopping = true;
        const numColumns = this.reelRender.gridSize.width;
        const { visibleSymbols, gridSize } = this.reelRender;

        for (let i = 0; i < numColumns; i++) {
            setTimeout(() => {
                this.activeColumns.delete(i);
                this.stopColumns.add(i);

                visibleSymbols.forEach((symbol, index) => {
                    const columnIndex = index % gridSize.width;

                    if (columnIndex === i) {
                        const outcome = this.endOutcomeConfig[columnIndex][Math.floor(index / gridSize.width)];
                        symbol.changeTexture(outcome);

                        const { x, y } = this.getCellPosition(index);
                        symbol.position.set(x, y);
                    }
                });

                if (this.stopColumns.size === numColumns) {
                    this.finishSpin();
                }
            }, i * this.stopDelayTime * 1000);
        }
    }

    private finishSpin() {
        this.isStopping = false;
        this.isSpinning = false;
        this.alignSymbolsToGrid();
        this.onSpinComplete?.();
    }

    private renderSpin(dt: number) {
        const { cellSize, gridSize, reelPosition, visibleSymbols } = this.reelRender;

        visibleSymbols.forEach((symbol, index) => {
            const columnIndex = index % gridSize.width;

            if (this.activeColumns.has(columnIndex)) {
                symbol.position.y += this.spinSpeed * dt;

                const reelHeight = gridSize.height * cellSize.height;
                if (symbol.position.y > reelPosition.y + reelHeight * 0.5) {
                    symbol.position.y -= reelHeight;

                    //randomize symbol sprite selection form symTypes enum
                    const randomSym = this.reelRender.symbolNames[Math.floor(Math.random() * this.reelRender.symbolNames.length)];
                    symbol.changeTexture(randomSym);

                }
            }
        });
    }


    private alignSymbolsToGrid() {
        this.reelRender.visibleSymbols.forEach((symbol, index) => {
            const { x, y } = this.getCellPosition(index);
            symbol.position.set(x, y);
        });
    }

    private getCellPosition(index: number) {
        const { reelPosition, cellSize, gridSize } = this.reelRender;

        const topLeft = {
            x: reelPosition.x - gridSize.width * cellSize.width * 0.5,
            y: reelPosition.y - gridSize.height * cellSize.height * 0.5,
        };

        const row = Math.floor(index / gridSize.width);
        const col = index % gridSize.width;

        const xPos = topLeft.x + col * cellSize.width + cellSize.width * 0.5;
        const yPos = topLeft.y + row * cellSize.height + cellSize.height * 0.5;

        return {
            x: xPos,
            y: yPos,
        };
    }
}
