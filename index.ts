import { Application, Assets, Sprite, Container, ViewContainer, Rectangle, Graphics, Ticker, TickerCallback } from 'pixi.js';
import { Tween } from '@tweenjs/tween.js'
import { Machine } from "./src/Machine";
import { urls } from "./img";
import { SpinButton } from "./src/SpinButton";
import { Outcome } from './src/Outcome';
import { ComponentManager, GameObject } from './src/GameObjectSystem/GameObjectSystem';
import { ReelRender } from './src/Reels/ReelRender';
import { SpinRender } from './src/Reels/SpinRender';
import { WinRender } from './src/Reels/WinRender';
import { CellPosition, SymTypeWinInfo } from './src/Reels/types';
import { TweenManager } from './src/TweenLogic/TweenManager';
import { EventBus, GameFlowEvents, PlayerEvents } from './src/EventsLogic/EventsBus';


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



        const onEnterSpinState = () => {
            reelRender.ResetSymbolsDim();

            const newReel = Outcome.resolve();
            gameLogic.handleWin(newReel);
            spinRender.StartSpin(newReel);

            spinRender.onSpinComplete = () => {
                game.setState(GameStates.PRESENTING_OUTCOME);
                onEnterPresentOutCome();
            }
        }

        const onEnterPresentOutCome = () => {
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
    await game.initialize(app, urls);

    const gameLogic = new GameLogic();

    const main = new MainScene(game, gameLogic);

    game.setScene(main);

    window.addEventListener('resize', () => {
        app.resize();
        main.resize();
    });

    app.ticker.add(({ deltaTime, lastTime }) => {
        main.update(deltaTime);

        ComponentManager.getInstance().updateComponents(deltaTime);
        TweenManager.getInstance().update(lastTime);
    });
})();



class GameLogic {
    private gameMechanic: WinHandler;

    public RecentResult: ResultMap;

    constructor() {
        this.gameMechanic = new WaysToWin();
    }

    public handleWin(result: string[][]): void {
        this.RecentResult = this.gameMechanic.GetResultsMap(result);

        console.log('recent result', this.RecentResult);
    }
}

class ResultMap {
    public WinMap: Map<string, SymTypeWinInfo>;
    public LossMap: Map<string, SymTypeWinInfo>;
}

interface WinHandler {
    GetResultsMap(result: string[][]): ResultMap;
}

enum SymTypes {
    high1 = 'high1',
    high2 = 'high2',
    high3 = 'high3',
    low1 = 'low1',
    low2 = 'low2',
    low3 = 'low3',
    low4 = 'low4',
}

class WaysToWin implements WinHandler {
    public hasWin: Boolean = false;

    constructor() { }

    public GetResultsMap(result: string[][]): ResultMap {

        const winMap = new Map<string, SymTypeWinInfo>();
        const lossMap = new Map<string, SymTypeWinInfo>();

        const typesOfSymbolsInReel = [...new Set(result.flat())];


        for (const sym in SymTypes) {
            const winInfo = this.checkForWinOfSymbol(sym as SymTypes, result);
            const symWinInfo = new SymTypeWinInfo(winInfo.cellPosition, winInfo.isWin);
            if (winInfo.isWin) {
                winMap.set(sym, symWinInfo);
            }
        }

        const winningSyms = Array.from(winMap).map(([key, value]) => value.cellPositions).flat();

        for (let row = 0; row < result.length; row++) {
            const currentRow = result[row];
            for (let col = 0; col < currentRow.length; col++) {
                const isWinningCell = winningSyms.some(cell => cell.reel === col && cell.row === row);
                if (isWinningCell) continue;

                const sym = currentRow[col];

                let lossInfo = lossMap.get(sym);
                if (!lossInfo) {
                    lossInfo = new SymTypeWinInfo([], false);
                    lossMap.set(sym, lossInfo);
                }

                lossInfo.cellPositions.push(new CellPosition(col, row));
            }
        }



        return { WinMap: winMap, LossMap: lossMap };
    }

    private checkForWinOfSymbol(symbol: SymTypes, result: string[][]): { cellPosition: CellPosition[]; isWin: boolean } {
        const cellPositions: CellPosition[] = [];
        let consecutiveWin = 0;

        for (let row = 0; row < result.length; row++) {
            const reel = result[row];
            const matchingPositions: CellPosition[] = [];

            for (let col = 0; col < reel.length; col++) {
                if (reel[col] === symbol) {
                    matchingPositions.push(new CellPosition(col, row));
                }
            }

            // Update consecutive win count or reset if no match
            if (matchingPositions.length > 0) {
                consecutiveWin++;
                cellPositions.push(...matchingPositions);
            } else {
                break;
            }
        }

        const isWin = consecutiveWin >= 3;
        return { cellPosition: cellPositions, isWin };
    }
}
