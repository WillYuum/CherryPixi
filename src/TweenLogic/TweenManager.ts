import { Tween } from "@tweenjs/tween.js";

/**
 * TweenManager is a singleton class that will manage all the tweens in the game
 * when they're added until they're removed.
 */
export class TweenManager {
    private static _instance: TweenManager;
    private tweens: Tween[] = [];
    private hasTweens: boolean = false;

    public static getInstance(): TweenManager {
        if (!TweenManager._instance) {
            TweenManager._instance = new TweenManager();
        }

        return TweenManager._instance;
    }

    public AddTween(tween: Tween): void {
        this.tweens.push(tween);
        this.hasTweens = true;
    }


    public RemoveTween(tween: Tween): void {
        const index = this.tweens.indexOf(tween);
        if (index !== -1) {
            this.tweens.splice(index, 1);
            this.hasTweens = this.tweens.length > 0;
        }
    }

    public update(deltaTime: number): void {
        if (!this.hasTweens) return;

        for (let i = this.tweens.length - 1; i >= 0; i--) {
            const tween = this.tweens[i];
            tween.update(deltaTime);
        }
    }
}
