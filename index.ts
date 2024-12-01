import { Application, Assets, Sprite, Container, ViewContainer, Rectangle, Graphics, Ticker, TickerCallback } from 'pixi.js';
import { Machine } from "./src/Machine";
import { urls } from "./img";
import { SpinButton } from "./src/SpinButton";
import { SymbolSprite } from "./src/SymbolSprite";


class MainScene extends Container {
    private _machine: Machine;
    private _spinButton: SpinButton;

    constructor() {
        super();

        const background = Sprite.from('background');
        this.addChild(background);

        this.boundsArea = new Rectangle(0, 0, window.innerWidth, window.innerHeight);

        const reelPosition = { x: innerWidth * 0.5, y: innerHeight * 0.5 };


        const reels = new GameObject("Reels", this);

        const reelRender = reels.addComponent(new ReelRender(reelPosition));
        const spinRender = reels.addComponent(new SpinRender());

        const spriteComp = reels.addVisualComponent(Sprite.from('reels_base'));
        spriteComp.anchor.set(0.5);
        spriteComp.position.set(reelRender.reelPosition.x, reelRender.reelPosition.y);





        const machine = new Machine();
        machine.position.set(innerWidth * 0.5 - reels.holder.width * 0.5, innerHeight * 0.5 - reels.holder.height * 0.5);
        // machine.position.set(innerWidth * 0.5 - reels.width * 0.5, innerHeight * 0.5 - reels.height * 0.5);
        this.addChild(machine);

        const spinButton = new SpinButton();
        spinButton.position.set(innerWidth * 0.85, innerHeight * 0.85);
        this.addChild(spinButton);

        this._machine = machine;
        this._spinButton = spinButton;

        spinButton.on('click', () => {
            spinRender.StartSpin();
        });
    }

    update(dt) {
        this._machine.update(dt);
        this._spinButton.update(dt);
    }





    public resize() {
        const { innerWidth, innerHeight } = window;
        this._machine.position.set(innerWidth * 0.5 - this._machine.width * 0.5, innerHeight * 0.5 - this._machine.height * 0.5);
        this._spinButton.position.set(innerWidth * 0.85, innerHeight * 0.85);
    }
}

class Game {
    public app: Application;

    constructor() { }

    async initialize(app: Application, urls: any) {
        this.app = app;
        await Assets.load(urls);
    }

    setScene(scene: Container) {
        this.app.stage = scene;
    }
}

(async () => {
    const app = new Application();
    await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        resizeTo: window,
    });
    document.body.appendChild(app.canvas);

    const game = new Game();
    await game.initialize(app, urls);

    const main = new MainScene();
    game.setScene(main);


    window.addEventListener('resize', () => {
        app.resize();
        main.resize();
    });

    app.ticker.add(({ deltaTime }) => {
        main.update(deltaTime);

        ComponentManager.getInstance().updateComponents(deltaTime);
    });
})();



class Component {
    gameObject: GameObject;

    constructor() {
        ComponentManager.getInstance().addComponent(this);
    }

    update(deltaTime: number) {
    }
}




class GameObject {
    name: string;
    components: Component[] = [];
    viewComponents: ViewContainer[] = [];
    holder: Container;

    constructor(name: string, parent: Container) {
        this.name = name;
        this.holder = new Container();
        parent.addChild(this.holder);
    }


    addComponent<T extends Component>(component: T): T {
        this.components.push(component);

        component.gameObject = this;

        return component;
    }

    getComponent<T extends Component>(componentClass: new (...args: any[]) => T): T | undefined {
        return this.components.find(c => c instanceof componentClass) as T | undefined;
    }

    removeComponent(component: Component): Boolean {
        const index = this.components.indexOf(component);
        if (index !== -1) {
            ComponentManager.getInstance().removeComponent(component);
            this.components.splice(index, 1);
            return true;
        }

        return false;
    }

    addVisualComponent<T extends ViewContainer>(viewComponent: T): T {
        this.viewComponents.push(viewComponent);
        this.holder.addChild(viewComponent);
        return viewComponent;
    }

    getVisualComponent<T extends ViewContainer>(componentClass: new (...args: any[]) => T): T | undefined {
        return this.viewComponents.find(vc => vc instanceof componentClass) as T | undefined;
    }

    removeVisualComponent(viewComponent: ViewContainer): void {
        const index = this.viewComponents.indexOf(viewComponent);
        if (index !== -1) {
            this.viewComponents.splice(index, 1);
        }
    }

}





class ReelRender extends Component {
    visibleSymbols: SymbolSprite[] = [];
    gridSize = { width: 5, height: 4 };
    stencilMask: Graphics;
    cellSize = { width: 200, height: 145 };


    reelPosition: { x: number, y: number } = { x: 0, y: 0 };

    constructor(reelPosition: { x: number, y: number }) {
        super();
        this.reelPosition = reelPosition;
        setTimeout(() => {
            console.log('this.gameObject', this.gameObject);
            this.renderSymbolsOnStart();


            this.gameObject.holder.boundsArea = new Rectangle(0, 0, this.gridSize.width * this.cellSize.width, this.gridSize.height * this.cellSize.height);

            this.stencilMask = new Graphics()
                .fill({
                    color: 0x000000,
                    alpha: 0.5,
                })
                .rect(0, 0, this.gridSize.width * this.cellSize.width, this.gridSize.height * this.cellSize.height)
                .endFill();



            this.gameObject.holder.addChild(this.stencilMask);

            this.gameObject.holder.mask = this.stencilMask;
            this.stencilMask.position.set(this.reelPosition.x - this.gridSize.width * this.cellSize.width * 0.5, this.reelPosition.y - this.gridSize.height * this.cellSize.height * 0.5);
        }, 1000);
    }


    private renderSymbolsOnStart() {
        const symbolAssetNames = [
            'high1',
            'high2',
            'high3',
            'low1',
            'low2',
            'low3',
            'low4',
        ];


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
            const symbol = createSymbol(Sprite.from(symbolAssetNames[i % symbolAssetNames.length]));

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
}


class ComponentManager {
    private static instance: ComponentManager;
    private components: Set<Component> = new Set();

    // Private constructor to prevent direct instantiation
    private constructor() { }

    // Get the singleton instance
    static getInstance() {
        if (!this.instance) {
            this.instance = new ComponentManager();
        }
        return this.instance;
    }

    // Register a component for updating
    addComponent(component: Component) {
        this.components.add(component);
    }

    // Remove a component when it's no longer needed
    removeComponent(component: Component) {
        this.components.delete(component);
    }

    // Update all components
    updateComponents(deltaTime: number) {
        for (let component of this.components) {
            component.update(deltaTime);
        }
    }
}




class SpinRender extends Component {
    spinSpeed: number = 25.0;
    isSpinning: boolean = false;
    isStopping: boolean = false;  // New state for stopping
    reelRender: ReelRender;

    private spinDuration: number = 2.5; // Total duration of the spin in seconds
    private columnDelayTime: number = 0.5; // Delay time between each column in seconds
    private stopDelayTime: number = 0.5; // Delay time between stopping each reel
    private activeColumns: Set<number> = new Set(); // Tracks which columns are actively spinning
    private stopColumns: Set<number> = new Set();  // Tracks which columns have stopped

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

    public StartSpin() {
        if (this.isSpinning) return;

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

