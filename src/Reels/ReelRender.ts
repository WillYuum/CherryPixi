import { Container, Graphics, Rectangle, Sprite } from "pixi.js";
import { Component } from "@willyuum/pixi-gameobject-system";
import { SymbolSprite } from "../SymbolSprite";
import { CellPosition } from "./types";
import { SymTypes } from "../GameLogic";

/**
 * Responsible for sizing the cells of the grid and visualizing symbols
 * & posotiiong them + hold information about the grid and their symbols.
 */
export class ReelRender extends Component {
    visibleSymbols: SymbolSprite[] = [];
    gridSize = { width: 5, height: 3 };
    stencilMask: Graphics;
    cellSize = { width: 200, height: 192 };

    symbolHolder: Container;

    public symbolNames: string[];


    reelPosition: { x: number, y: number } = { x: 0, y: 0 };
    startConfig: string[][] = [];

    constructor(reelPosition: { x: number, y: number }, startConfig: string[][]) {
        super();
        this.reelPosition = reelPosition;
        this.startConfig = startConfig;

        this.symbolNames = Object.values(SymTypes);
    }

    awake(): void {
        this.symbolHolder = new Container();
        this.renderSymbolsOnStart(this.startConfig);


        this.gameObject.holder.addChild(this.symbolHolder);

        this.stencilMask = new Graphics()
            .fill({
                color: 0x000000,
            })
            .rect(0, 0, this.gridSize.width * this.cellSize.width, this.gridSize.height * this.cellSize.height)
            .endFill();



        this.symbolHolder.addChild(this.stencilMask);

        this.symbolHolder.mask = this.stencilMask;
        this.stencilMask.position.set(this.reelPosition.x - this.gridSize.width * this.cellSize.width * 0.5, this.reelPosition.y - this.gridSize.height * this.cellSize.height * 0.5);
    }


    private renderSymbolsOnStart(startConfig: string[][]) {

        const symbolsToSpawn = startConfig.map(row => row.map(symbol => symbol)).flat();


        const createSymbol = (sprite: Sprite) => {
            const symbol = new SymbolSprite(sprite);
            return symbol;
        }

        const cellSize = this.cellSize;

        const startPosition = this.reelPosition

        const topLeftPositionOfReel = { x: startPosition.x - this.gridSize.width * cellSize.width * 0.5, y: startPosition.y - this.gridSize.height * cellSize.height * 0.5 };

        const toalSymbolSize = this.gridSize.width * this.gridSize.height;
        for (let i = 0; i < toalSymbolSize; i++) {
            const symbol = createSymbol(Sprite.from(symbolsToSpawn[i % symbolsToSpawn.length]));

            // const row = Math.floor(i / this.reelSize.width);
            const row = Math.floor(i / this.gridSize.width);
            const col = i % this.gridSize.width;

            const xPos = topLeftPositionOfReel.x + col * cellSize.width + (cellSize.width * 0.5);
            const yPos = topLeftPositionOfReel.y + row * cellSize.height + (cellSize.height * 0.5);

            symbol.position.set(xPos, yPos);
            this.symbolHolder.addChild(symbol);
            this.visibleSymbols.push(symbol);
        }
    }

    public ResetSymbolsDim() {
        this.visibleSymbols.forEach(symbol => {
            symbol.sprite.alpha = 1.0;
            symbol.resetColor();
        });
    }


    public GetSymbolFromCellPosition(cellPosition: CellPosition): SymbolSprite {
        return this.visibleSymbols[cellPosition.row * this.gridSize.width + cellPosition.column];
    }

    public GetPositionFromCellPosition(cellPosition: CellPosition): { x: number, y: number } {
        return {
            x: cellPosition.row * this.cellSize.width + this.reelPosition.x,
            y: cellPosition.column * this.cellSize.height + this.reelPosition.y
        }
    }


    public GetPostionOnReelFromCellPosition(cellPosition: CellPosition): { x: number, y: number } {
        return {
            x: this.reelPosition.x - this.gridSize.width * this.cellSize.width * 0.5 + cellPosition.column * this.cellSize.width + (this.cellSize.width * 0.5),
            y: this.reelPosition.y - this.gridSize.height * this.cellSize.height * 0.5 + cellPosition.row * this.cellSize.height + (this.cellSize.height * 0.5)
        }

    }

}
