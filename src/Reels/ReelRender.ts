import { Graphics, Rectangle, Sprite } from "pixi.js";
import { Component } from "../GameObjectSystem/GameObjectSystem";
import { SymbolSprite } from "../SymbolSprite";
import { CellPosition } from "./types";


export class ReelRender extends Component {
    visibleSymbols: SymbolSprite[] = [];
    gridSize = { width: 5, height: 3 };
    stencilMask: Graphics;
    cellSize = { width: 200, height: 192 };


    reelPosition: { x: number, y: number } = { x: 0, y: 0 };

    constructor(reelPosition: { x: number, y: number }, startConfig: string[][]) {
        super();
        this.reelPosition = reelPosition;
        setTimeout(() => {
            console.log('this.gameObject', this.gameObject);
            this.renderSymbolsOnStart(startConfig);


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
        }, 1000);
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
        const debugGraphics = new Graphics()
            .clear()
            .circle(topLeftPositionOfReel.x, topLeftPositionOfReel.y, 10)
            .fill(0xae040a);



        const debugReelsRect = new Graphics()
            .rect(topLeftPositionOfReel.x, topLeftPositionOfReel.y, this.gridSize.width * cellSize.width, this.gridSize.height * cellSize.height)
            .stroke(0xae040a);

        this.gameObject.holder.addChild(debugReelsRect);


        debugGraphics.zIndex = 1000;

        this.gameObject.holder.addChild(debugGraphics);


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
        });
    }


    public GetSymbolFromCellPosition(cellPosition: CellPosition): SymbolSprite {
        return this.visibleSymbols[cellPosition.reel * this.gridSize.width + cellPosition.row];
    }
}
