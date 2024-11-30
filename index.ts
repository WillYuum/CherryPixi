import { Application, Assets, Sprite, Container, ViewContainer, Rectangle, Graphics, Ticker } from 'pixi.js';
import { Machine } from "./src/Machine";
import { urls } from "./img";
import { SpinButton } from "./src/SpinButton";
import { SymbolSprite } from "./src/SymbolSprite";

// const screen = {
//     width: 1920,
//     height: 1080
// };


// Object freeze of events player can do and currently is pressed_spin



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
            // machine.startSpin(); 
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

        app.ticker.add((ticker: Ticker) => {
            ComponentManager.getInstance().updateComponents(ticker.deltaTime);
        });
    });
})();



class Component {
    gameObject: GameObject;

    constructor() {
        // Register with the global component manager
        ComponentManager.getInstance().addComponent(this);
    }

    update(deltaTime: number) {
        // Component-specific update logic
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
        // const componentName = component.constructor.name.toLowerCase();
        // this.components[componentName] = component;
        this.components.push(component);

        component.gameObject = this;

        return component;
    }

    // getComponent(componentName: string): Component | undefined {
    //     return this.components[componentName];
    // }
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
    reelSize = { width: 5, height: 4 };
    stencilMask: Graphics;
    cellSize = { width: 200, height: 145 };


    reelPosition: { x: number, y: number } = { x: 0, y: 0 };

    constructor(reelPosition: { x: number, y: number }) {
        super();
        this.reelPosition = reelPosition;
        setTimeout(() => {
            console.log('this.gameObject', this.gameObject);
            this.renderSymbolsOnStart();
            this.stencilMask = new Graphics()
                .fill({
                    color: 0x000000,
                    alpha: 0.5,
                })
                .rect(0, 0, this.reelSize.width * this.cellSize.width, this.reelSize.height * this.cellSize.height)
                .endFill();

            this.gameObject.holder.addChild(this.stencilMask);
            this.gameObject.holder.mask = this.stencilMask;
            this.stencilMask.position.set(this.reelPosition.x - this.reelSize.width * this.cellSize.width * 0.5, this.reelPosition.y - this.reelSize.height * this.cellSize.height * 0.5);
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

        // const startPosition = { x: this.reelPosition.x + cellSize.width * 0.5, y: this.reelPosition.y + cellSize.height * 0.5 };
        const startPosition = this.reelPosition

        const topLeftPositionOfReel = { x: startPosition.x - this.reelSize.width * cellSize.width * 0.5, y: startPosition.y - this.reelSize.height * cellSize.height * 0.5 };
        const debugGraphics = new Graphics()
            .clear()
            .circle(topLeftPositionOfReel.x, topLeftPositionOfReel.y, 10)
            .fill(0xae040a);



        const debugReelsRect = new Graphics()
            .rect(topLeftPositionOfReel.x, topLeftPositionOfReel.y, this.reelSize.width * cellSize.width, this.reelSize.height * cellSize.height)
            .stroke(0xae040a);

        this.gameObject.holder.addChild(debugReelsRect);


        debugGraphics.zIndex = 1000;

        this.gameObject.holder.addChild(debugGraphics);


        const toalSymbolSize = this.reelSize.width * this.reelSize.height;
        for (let i = 0; i < toalSymbolSize; i++) {
            const symbol = createSymbol(Sprite.from(symbolAssetNames[i % symbolAssetNames.length]));

            // const row = Math.floor(i / this.reelSize.width);
            const row = Math.floor(i / this.reelSize.width);
            const col = i % this.reelSize.width;

            const xPos = topLeftPositionOfReel.x + col * cellSize.width + (cellSize.width * 0.5);
            const yPos = topLeftPositionOfReel.y + row * cellSize.height + (cellSize.height * 0.5);

            symbol.position.set(xPos, yPos);
            this.gameObject.holder.addChild(symbol);
            this.visibleSymbols.push(symbol);
        }

        // for (let i = 0; i < toalSymbolSize; i++) {
        //     const symbol = createSymbol(Sprite.from(symbolAssetNames[i % symbolAssetNames.length]));

        //     const row = Math.floor(i / this.reelSize.width);
        //     const col = i % this.reelSize.width;

        //     symbol.position.set(col * cellSize.width, row * cellSize.height);


        //     this.gameObject.holder.addChild(symbol);
        // }
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
    spinSpeed: number = 0.1;

    reelRender: ReelRender;

    constructor() {
        super();

        setTimeout(() => {

            this.reelRender = this.gameObject.getComponent(ReelRender);
        }, 1000);
    }

    isSpinning: boolean = false;

    public StartSpin() {
        console.log('StartSpin');
        this.isSpinning = true;
    }

    public EndSpin() {
        this.isSpinning = false
    }

    renderSpin(dt: number) {
        this.reelRender.visibleSymbols.forEach(symbol => {
            symbol.position.y += this.spinSpeed * dt;
        });
    }



    public update(dt: number) {
        if (this.isSpinning) {
            this.renderSpin(dt);
        }
    }
}




