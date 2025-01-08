import { Tween } from "@tweenjs/tween.js";

/**
 * TweenManager is a singleton class that will manage all the tweens in the game
 * when they're added until they're removed.
 */
export class TweenManager {
    private static _instance: TweenManager;
    private tweens: Tween[] = [];


    public static getInstance(): TweenManager {
        if (!TweenManager._instance) {
            TweenManager._instance = new TweenManager();
        }

        return TweenManager._instance;
    }


    public AddTween(tween: Tween): void {
        this.tweens.push(tween);
    }

    public RemoveTween(tween: Tween): void {
        this.tweens.splice(this.tweens.indexOf(tween), 1);
    }


    public update(deltaTime: number): void {
        if (this.tweens.length === 0) return;
        for (let i = this.tweens.length - 1; i >= 0; i--) {
            const tween = this.tweens[i];
            tween.update(deltaTime);

        }
    }
}