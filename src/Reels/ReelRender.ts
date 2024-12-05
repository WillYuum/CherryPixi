import { Graphics, Rectangle, Sprite } from "pixi.js";
import { Component } from "../GameObjectSystem/GameObjectSystem";
import { SymbolSprite } from "../SymbolSprite";
import { CellPosition } from "./types";
import { SymTypes } from "../GameLogic";


export class ReelRender extends Component {
    visibleSymbols: SymbolSprite[] = [];
    gridSize = { width: 5, height: 3 };
    stencilMask: Graphics;
    cellSize = { width: 200, height: 192 };

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
        this.renderSymbolsOnStart(this.startConfig);


        this.gameObject.holder.boundsArea = new Rectangle(0, 0, this.gridSize.width * this.cellSize.width, this.gridSize.height * this.cellSize.height);

        this.stencilMask = new Graphics()
            .fill({
                color: 0x000000,
            })
            .rect(0, 0, this.gridSize.width * this.cellSize.width, this.gridSize.height * this.cellSize.height)
            .endFill();



        this.gameObject.holder.addChild(this.stencilMask);

        this.gameObject.holder.mask = this.stencilMask;
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
            this.gameObject.holder.addChild(symbol);
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
        return this.visibleSymbols[cellPosition.x * this.gridSize.width + cellPosition.y];
    }
}
