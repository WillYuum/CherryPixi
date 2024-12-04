import { Application, Assets, Sprite, Container, ViewContainer, Rectangle, Graphics, Ticker, TickerCallback } from 'pixi.js';
import { Tween } from '@tweenjs/tween.js'
import { Machine } from "./src/Machine";
import { urls } from "./img";
import { SpinButton } from "./src/SpinButton";
import { SymbolSprite } from "./src/SymbolSprite";
import { Outcome } from './src/Outcome';
import { ComponentManager, GameObject } from './src/GameObjectSystem/GameObjectSystem';
import { ReelRender } from './src/Reels/ReelRender';
import { SpinRender } from './src/Reels/SpinRender';
import { WinRender } from './src/Reels/WinRender';
import { CellPosition, SymTypeWinInfo } from './src/Reels/types';

enum GameStates {
    IDLE,
    SPINNING,
    PRESENTING_OUTCOME,
}

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

        const startConfig: string[][] = [

            ['high3', 'low1', 'high2'],
            ['low2', 'high3', 'low2'],
            ['low1', 'low1', 'high3'],
            ['low3', 'high1', 'high1'],
            ['high1', 'high1', 'low4'],
        ];

        const reelRender = reels.addComponent(new ReelRender(reelPosition, startConfig));
        const spinRender = reels.addComponent(new SpinRender());
        const winRender = reels.addComponent(new WinRender());

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

        const gameLogic = new GameLogic();



        var isSpinning = false;
        spinRender.onSpinComplete = () => {
            isSpinning = false;
            winRender.renderWin(gameLogic.RecentResult.WinMap);
            winRender.renderLoss(gameLogic.RecentResult.LossMap);
        }


        spinButton.on('click', () => {
            if (isSpinning) return;

            isSpinning = true;
            reelRender.ResetSymbolsDim();

            const newReel = Outcome.resolve();

            // const finalResult: string[][] = [
            //     ['high3', 'low1', 'high2'],
            //     ['low2', 'high3', 'low2'],
            //     ['low1', 'low1', 'high3'],
            //     ['low3', 'high1', 'high1'],
            //     ['high1', 'high1', 'low4'],
            // ];

            gameLogic.handleWin(newReel);
            spinRender.StartSpin(newReel);
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
    public CurrentState: GameStates;

    constructor() { }

    async initialize(app: Application, urls: any) {
        this.app = app;
        await Assets.load(urls);
    }

    setScene(scene: Container) {
        this.app.stage = scene;
    }

    public setState(state: GameStates) {
        this.CurrentState = state;
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

    game.setState(GameStates.IDLE);


    window.addEventListener('resize', () => {
        app.resize();
        main.resize();
    });

    app.ticker.add(({ deltaTime }) => {
        main.update(deltaTime);

        ComponentManager.getInstance().updateComponents(deltaTime);
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
        console.log("Check for win in ", result);

        const winMap = new Map<string, SymTypeWinInfo>();
        const lossMap = new Map<string, SymTypeWinInfo>();

        const typesOfSymbolsInReel = [...new Set(result.flat())];


        for (const sym in SymTypes) {
            console.log('Checking for symbol', sym);
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
