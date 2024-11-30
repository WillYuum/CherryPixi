import { Application, Assets, Sprite, Container, ViewContainer, Rectangle, Graphics } from 'pixi.js';
import { Machine } from "./src/Machine";
import { urls } from "./img";
import { SpinButton } from "./src/SpinButton";
import { SymbolSprite } from "./src/SymbolSprite";

// const screen = {
//     width: 1920,
//     height: 1080
// };



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
    });
})();



class Component {
    gameObject: GameObject;
}




class GameObject {
    name: string;
    components: { [key: string]: Component } = {};
    viewComponents: ViewContainer[] = [];
    holder: Container;

    constructor(name: string, parent: Container) {
        this.name = name;
        this.holder = new Container();
        parent.addChild(this.holder);
    }


    addComponent<T extends Component>(component: T): T {
        const componentName = component.constructor.name.toLowerCase();
        this.components[componentName] = component;

        component.gameObject = this;

        return component;
    }

    getComponent(componentName: string): Component | undefined {
        return this.components[componentName];
    }

    removeComponent(componentName: string): void {
        this.components[componentName].gameObject = null;
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
    visibleSymbols: Symbol[] = [];
    reelSize = { width: 5, height: 4 };


    reelPosition: { x: number, y: number } = { x: 0, y: 0 };

    constructor(reelPosition: { x: number, y: number }) {
        super();
        this.reelPosition = reelPosition;
        setTimeout(() => {
            console.log('this.gameObject', this.gameObject);
            this.renderSymbolsOnStart();

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

        const cellSize = { width: 200, height: 145 };

        const createSymbol = (sprite: Sprite) => {
            const symbol = new SymbolSprite(sprite);
            return symbol;
        }

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



