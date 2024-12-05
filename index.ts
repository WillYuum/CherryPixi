import { Application, Assets, Sprite, Container, ViewContainer, Rectangle, Graphics, Ticker, TickerCallback } from 'pixi.js';
import { urls } from "./img";
import { SpinButton } from "./src/SpinButton";
import { ComponentManager, GameObject } from './src/GameObjectSystem/GameObjectSystem';
import { ReelRender } from './src/Reels/ReelRender';
import { SpinRender } from './src/Reels/SpinRender';
import { WinRender } from './src/Reels/WinRender';
import { TweenManager } from './src/TweenLogic/TweenManager';
import { EventBus, GameFlowEvents, PlayerEvents } from './src/EventsLogic/EventsBus';
import { GameLogic } from './src/GameLogic';
import { Outcome } from './src/Outcome';


class MainScene extends Container {
    private _spinButton: SpinButton;

    constructor(game: Game, gameLogic: GameLogic) {
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

        const reels = new GameObject("Reels", this);
        const reelRender = reels.addComponent(new ReelRender(reelPosition, startConfig));
        const spinRender = reels.addComponent(new SpinRender());
        const winRender = reels.addComponent(new WinRender());

        const spriteComp = reels.addVisualComponent(Sprite.from('reels_base'));
        spriteComp.anchor.set(0.5);
        spriteComp.position.set(reelRender.reelPosition.x, reelRender.reelPosition.y);



        const spinButton = new SpinButton();
        spinButton.position.set(innerWidth * 0.85, innerHeight * 0.85);
        this.addChild(spinButton);


        var cheatMoveActive = false;
        EventBus.getInstance().subscribe(PlayerEvents.TOGGLE_CHEAT, () => {
            cheatMoveActive = !cheatMoveActive;
        });


        const onEnterSpinState = () => {
            reelRender.ResetSymbolsDim();

            const newReel = cheatMoveActive ? Outcome.pickFromRandomWinOutcomes() : Outcome.resolve();

            console.log("Resolved outcome: ", newReel);

            gameLogic.handleWin(newReel);
            spinRender.StartSpin(newReel);

            spinRender.onSpinComplete = () => {
                game.setState(GameStates.PRESENTING_OUTCOME);
                onEnterPresentOutCome();
            }
        }

        const onEnterPresentOutCome = () => {

            if (gameLogic.RecentResult.WinMap.size === 0) {
                onEnterIdleState();
                return;
            }

            winRender.renderWin(gameLogic.RecentResult.WinMap);
            winRender.renderLoss(gameLogic.RecentResult.LossMap);

            winRender.onPresentWinComplete = () => {
                onEnterIdleState();
            }

        }

        const onEnterIdleState = () => {
            game.setState(GameStates.IDLE);
            EventBus.getInstance().subscribeOnce(PlayerEvents.PRESS_SPIN, () => {
                game.setState(GameStates.SPINNING);
                onEnterSpinState();
            });
        }

        onEnterIdleState();

        this._spinButton = spinButton;
    }

    update(dt) {
        this._spinButton.update(dt);
    }

    public resize() {
        const { innerWidth, innerHeight } = window;
        this._spinButton.position.set(innerWidth * 0.85, innerHeight * 0.85);
    }
}

export enum GameStates {
    IDLE = "Idle",
    SPINNING = "Spinning",
    PRESENTING_OUTCOME = "Presenting_Outcome",
}

class StateMachine {
    private currentState: GameStates;

    constructor(private game: Game, private gameLogic: GameLogic) { }

    public setState(stateName: GameStates): void {

        this.currentState = stateName;
        EventBus.getInstance().publish(GameFlowEvents.STATE_CHANGED, stateName); // Publish state change once

    }
}


class Game {
    public app: Application;
    private stateMachine: StateMachine;
    private gameLogic: GameLogic;
    constructor() { }

    async initialize(app: Application, urls: any): Promise<void> {
        this.app = app;
        await Assets.load(urls);

        // Subscribe to state changes for debugging or UI updates
        EventBus.getInstance().subscribe(GameFlowEvents.STATE_CHANGED, (newState: GameStates) => {
            console.log(`Game state changed to: ${newState}`);
        });

        // Initialize state machine
        this.stateMachine = new StateMachine(this, this.gameLogic);
    }

    setScene(scene: Container): void {
        this.app.stage = scene;
    }

    public setState(state: GameStates): void {
        switch (state) {
            case GameStates.IDLE:
                this.stateMachine.setState(GameStates.IDLE);
                break;
            case GameStates.SPINNING:
                this.stateMachine.setState(GameStates.SPINNING);
                break;
            case GameStates.PRESENTING_OUTCOME:
                this.stateMachine.setState(GameStates.PRESENTING_OUTCOME);
                break;
            default:
                throw new Error(`Unknown state: ${state}`);
        }
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
    game.initialize(app, urls).then(() => {
        const gameLogic = new GameLogic();

        const main = new MainScene(game, gameLogic);

        game.setScene(main);


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
