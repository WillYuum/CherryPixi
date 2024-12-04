import { Component } from "../GameObjectSystem/GameObjectSystem";
import { ReelRender } from "./ReelRender";

export class SpinRender extends Component {
    spinSpeed: number = 25.0;
    isSpinning: boolean = false;
    isStopping: boolean = false;  // New state for stopping
    reelRender: ReelRender;

    onSpinComplete?: () => void;

    private spinDuration: number = 2.5; // Total duration of the spin in seconds
    private columnDelayTime: number = 0.5; // Delay time between each column in seconds
    private stopDelayTime: number = 0.5; // Delay time between stopping each reel
    private activeColumns: Set<number> = new Set(); // Tracks which columns are actively spinning
    private stopColumns: Set<number> = new Set();  // Tracks which columns have stopped

    private endOutcomeConfig: string[][];

    constructor() {
        super();

        setTimeout(() => {
            this.reelRender = this.gameObject.getComponent(ReelRender);
        }, 1000);
    }

    public update(dt: number) {
        if (this.isSpinning) {
            this.renderSpin(dt);
        }

        if (this.isStopping) {
            this.renderStop(dt);
        }
    }

    public StartSpin(endOutcomeConfig: string[][]) {
        if (this.isSpinning) return;

        this.endOutcomeConfig = endOutcomeConfig;

        this.isSpinning = true;
        this.isStopping = false;
        this.activeColumns.clear();
        this.stopColumns.clear();

        const numColumns = this.reelRender.gridSize.width;

        // Schedule each column to start spinning
        for (let i = 0; i < numColumns; i++) {
            setTimeout(() => {
                this.activeColumns.add(i);
                if (i === numColumns - 1) {
                    // End the spin after the total duration and start the stop sequence
                    setTimeout(() => this.StartStop(), this.spinDuration * 1000);
                }
            }, i * this.columnDelayTime * 1000);
        }
    }

    private StartStop() {
        this.isStopping = true;
        const numColumns = this.reelRender.gridSize.width;

        // Schedule each column to stop one by one
        for (let i = 0; i <= numColumns; i++) {
            setTimeout(() => {
                console.log('stop column', i);
                this.stopColumns.add(i);
                if (this.stopColumns.size === numColumns) {
                    console.log('all columns stopped');
                    // Finalize the stopping sequence
                    this.isStopping = false;
                    this.isSpinning = false;
                    this.alignSymbolsToGrid();

                    this.onSpinComplete?.();
                }
            }, i * this.stopDelayTime * 1000);
        }
    }

    private renderSpin(dt: number) {
        this.reelRender.visibleSymbols.forEach((symbol, index) => {
            const columnIndex = index % this.reelRender.gridSize.width;

            if (this.activeColumns.has(columnIndex)) {
                symbol.position.y += this.spinSpeed * dt;

                // Reset symbol to the top if it goes out of bounds
                if (
                    symbol.position.y >
                    this.reelRender.reelPosition.y +
                    this.reelRender.gridSize.height *
                    this.reelRender.cellSize.height *
                    0.5
                ) {
                    symbol.position.y -=
                        this.reelRender.gridSize.height * this.reelRender.cellSize.height;
                }
            }
        });
    }

    private renderStop(dt: number) {
        // Decrease the speed of the reel based on the stopColumns
        this.reelRender.visibleSymbols.forEach((symbol, index) => {
            const columnIndex = index % this.reelRender.gridSize.width;

            if (this.stopColumns.has(columnIndex)) {
                // symbol.position.y = Math.floor(symbol.position.y / this.reelRender.cellSize.height) * this.reelRender.cellSize.height;
                // this.alignSymbolsToReel(index);

                // console.log('this.endOutcomeConfig', this.endOutcomeConfig);
                // const reel = this.endOutcomeConfig[columnIndex];
                // const symbolType = reel[index % this.reelRender.gridSize.height];

                // symbol.changeTexture(symbolType);
                symbol.changeTexture(this.endOutcomeConfig[index % this.reelRender.gridSize.width][Math.floor(index / this.reelRender.gridSize.width)]);

                symbol.position.y = this.getCellPosition(index).y;
            }
        });
    }

    private alignSymbolsToGrid() {
        const topLeftPositionOfReel = {
            x: this.reelRender.reelPosition.x - this.reelRender.gridSize.width * this.reelRender.cellSize.width * 0.5,
            y: this.reelRender.reelPosition.y - this.reelRender.gridSize.height * this.reelRender.cellSize.height * 0.5
        };

        this.reelRender.visibleSymbols.forEach((symbol, index) => {
            const row = Math.floor(index / this.reelRender.gridSize.width);
            const col = index % this.reelRender.gridSize.width;

            const xPos = topLeftPositionOfReel.x + col * this.reelRender.cellSize.width + this.reelRender.cellSize.width * 0.5;
            const yPos = topLeftPositionOfReel.y + row * this.reelRender.cellSize.height + this.reelRender.cellSize.height * 0.5;

            symbol.position.set(xPos, yPos);
        });
    }


    private getCellPosition(index: number) {
        const topLeftPositionOfReel = {
            x: this.reelRender.reelPosition.x - this.reelRender.gridSize.width * this.reelRender.cellSize.width * 0.5,
            y: this.reelRender.reelPosition.y - this.reelRender.gridSize.height * this.reelRender.cellSize.height * 0.5
        };

        const row = Math.floor(index / this.reelRender.gridSize.width);
        const col = index % this.reelRender.gridSize.width;

        const xPos = topLeftPositionOfReel.x + col * this.reelRender.cellSize.width + this.reelRender.cellSize.width * 0.5;
        const yPos = topLeftPositionOfReel.y + row * this.reelRender.cellSize.height + this.reelRender.cellSize.height * 0.5;

        return { x: xPos, y: yPos };
    }
}

