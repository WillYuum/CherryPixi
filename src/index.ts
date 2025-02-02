import { Application, Assets, Sprite, Container, ViewContainer, Rectangle, Graphics, Ticker, TickerCallback, Text } from 'pixi.js';
// import { urls } from "../public/folder";
import { SpinButton } from "./SpinButton";
import { ComponentManager, GameObject } from './GameObjectSystem/GameObjectSystem';
import { ReelRender } from './Reels/ReelRender';
import { SpinRender } from './Reels/SpinRender';
import { WinRender } from './Reels/WinRender';
import { TweenManager } from './TweenLogic/TweenManager';
import { EventBus, GameFlowEvents, PlayerEvents } from './EventsLogic/EventsBus';
import { GameLogic, ResultMap } from './GameLogic';
import { Outcome } from './Outcome';
import { Easing, Tween } from '@tweenjs/tween.js';


const asset_names = [
    'background.jpg',
    'reels_base.png',
    'high1.png',
    'high2.png',
    'high3.png',
    'low1.png',
    'low2.png',
    'low3.png',
    'low4.png',
    'reels_base.png',
    'spin_btn_disabled.png',
    'spin_btn_down.png',
    'spin_btn_hover.png',
    'spin_btn_normal.png',
    'spin_btn_over.png',
];

const urls = asset_names.map(name => {
    const aliasName = name.split('.')[0];

    return { alias: aliasName, src: `./assets/${name}` };
});

interface GameScene {
    onIdle(): void;
    onSpin(newReel: string[][]): Promise<true>;
    onResult(resultMap: ResultMap): Promise<true>;
}


class MainScene extends Container implements GameScene {
    private _spinButton: SpinButton;

    private _reels: GameObject;

    constructor() {
        super();

        const background = Sprite.from('background');
        this.addChild(background);

        this.boundsArea = new Rectangle(0, 0, window.innerWidth, window.innerHeight);
        const reelPosition = { x: innerWidth * 0.5, y: innerHeight * 0.5 };

        const startConfig: string[][] = [
            ['high3', 'low1', 'high2'],
            ['low2', 'high3', 'low2'],
            ['low1', 'low1', 'high3'],
            ['low3', 'high1', 'high1'],
            ['high1', 'high1', 'low4'],
        ];

        this._reels = new GameObject("Reels", this);
        const reelRender = this._reels.addComponent(new ReelRender(reelPosition, startConfig));
        const spinRender = this._reels.addComponent(new SpinRender());
        const winRender = this._reels.addComponent(new WinRender());

        const spriteComp = this._reels.addVisualComponent(Sprite.from('reels_base'));
        spriteComp.anchor.set(0.5);
        spriteComp.position.set(reelRender.reelPosition.x, reelRender.reelPosition.y);



        const spinButton = new SpinButton();
        spinButton.position.set(innerWidth * 0.85, innerHeight * 0.85);
        this.addChild(spinButton);


        const text = new Text("Right click button to enable cheat mode", { fill: 0x00000, fontSize: 15 });
        this.addChild(text);
        const textPosition = { x: spinButton.position.x - (text.width / 2), y: spinButton.position.y - (spinButton.height / 2) };
        text.position.set(textPosition.x, textPosition.y);


        var cheatMoveActive = false;
        EventBus.getInstance().subscribe(PlayerEvents.TOGGLE_CHEAT, () => {
            cheatMoveActive = !cheatMoveActive;
            text.text = cheatMoveActive ? "Cheat mode enabled" : "Right click button to enable cheat mode";

            const textPosition = { x: spinButton.position.x - (text.width / 2), y: spinButton.position.y - (spinButton.height / 2) };
            text.position.set(textPosition.x, textPosition.y);
        });

        this._spinButton = spinButton;
    }

    onIdle(): void {
        const reelRender = this._reels.getComponent(ReelRender);

        reelRender.ResetSymbolsDim();
    }

    onSpin(newReel: string[][]): Promise<true> {

        const spinRender = this._reels.getComponent(SpinRender);

        spinRender.StartSpin(newReel);

        const promise = new Promise<true>((resolve, reject) => {
            spinRender.onSpinComplete = () => {
                resolve(true);
            }
        })

        return promise;

    }

    onResult(resultMap: ResultMap): Promise<true> {
        const winRender = this._reels.getComponent(WinRender);

        return new Promise<true>((resolve, reject) => {
            if (resultMap.WinMap.size === 0) {
                console.log("No wins");
                resolve(true);
                return;
            }

            console.log("We are running the win animation");

            winRender.renderWin(resultMap.WinMap);
            winRender.renderLoss(resultMap.LossMap);

            setTimeout(() => {
                console.log("Win animation complete");
                resolve(true);
            }, 1500);
        });
    }

    update(dt) {
        this._spinButton.update(dt);
    }

    public resize() {
        const { innerWidth, innerHeight } = window;
        this._spinButton.position.set(innerWidth * 0.85, innerHeight * 0.85);
    }
}



class Game {
    public GameName: string = "Cherry Pixi";
    public app: Application;
    public gameStateController: GameStateController;

    constructor() { }

    async initialize(app: Application, urls: any, stateController: GameStateController): Promise<void> {
        this.app = app;
        this.gameStateController = stateController;
        await Assets.load(urls);

        // Subscribe to state changes for debugging or UI updates
        EventBus.getInstance().subscribe(GameFlowEvents.STATE_CHANGED, (newState: string) => {
            console.log(`Game state changed to: ${newState}`);
        });

    }

    setScene(scene: Container): void {
        this.app.stage = scene;
    }
}

class GameState {
    constructor(protected injectables: StateInjectables) {
    }

    public onEnter(): void { }

    public onExit(): void { }
}

interface StateInjectables {
    game: Game;
    gameLogic: GameLogic;
}

export class IdleState extends GameState {
    public onEnter(): void {
        const { game } = this.injectables;

        EventBus.getInstance().subscribeOnce(PlayerEvents.PRESS_SPIN, () => {
            console.log("game.gameStateController", game.gameStateController);
            game.gameStateController.setState(SpinState);
        });

        const gameScene: GameScene = game.app.stage as MainScene;
        gameScene.onIdle();

    }

    public onExit(): void {
        console.log(`Exiting Idle State`);
    }
}

export class SpinState extends GameState {
    constructor(stateInjectable: StateInjectables) {
        super(stateInjectable);
    }


    public onEnter(): void {
        const { game, gameLogic } = this.injectables;
        const newReel = Outcome.resolve();

        console.log("Resolved outcome: ", newReel);

        gameLogic.handleWin(newReel);

        const gameScene: GameScene = game.app.stage as MainScene;
        const handleOnSpin = gameScene.onSpin(newReel);

        handleOnSpin.then(() => {
            game.gameStateController.setState(ResultState);
        });
    }

    public onExit(): void {
        console.log(`Exiting Spin State`);
    }
}

export class ResultState extends GameState {
    constructor(stateInjectable: StateInjectables) {
        super(stateInjectable);
    }

    public onEnter(): void {
        const { game, gameLogic } = this.injectables;

        const gameScene: GameScene = game.app.stage as MainScene;
        const handleOnResult = gameScene.onResult(gameLogic.RecentResult);

        handleOnResult.then(() => {
            game.gameStateController.setState(IdleState);
        });
    }

    public onExit(): void {
        console.log(`Exiting Result State`);
    }
}

interface SetStateParam {
    new(stateInjectables: StateInjectables): GameState;
}

class GameStateController {
    private currentState: GameState;
    private stateInjectables: StateInjectables;

    constructor(stateInjectables: StateInjectables) {
        this.stateInjectables = stateInjectables;
    }

    public setState<T extends GameState>(stateClass: new (injectables: StateInjectables) => T): void {
        if (this.currentState) {
            this.currentState.onExit();
        }
        this.currentState = new stateClass(this.stateInjectables);
        EventBus.getInstance().publish(GameFlowEvents.STATE_CHANGED, this.currentState.constructor.name);
        this.currentState.onEnter();
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
    const gameLogic = new GameLogic();

    const stateController = new GameStateController({
        game: game,
        gameLogic: gameLogic,
    });



    game.initialize(app, urls, stateController).then(() => {

        const main = new MainScene();

        game.setScene(main);
        stateController.setState(IdleState);

        ComponentManager.getInstance().awakeComponents();


        window.addEventListener('resize', () => {
            app.resize();
            main.resize();
        });

        app.ticker.add(({ deltaTime, lastTime }) => {
            main.update(deltaTime);

            ComponentManager.getInstance().updateComponents(deltaTime);
            TweenManager.getInstance().update(lastTime);
        });

    });

})();
