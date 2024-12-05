import { Easing, Tween } from "@tweenjs/tween.js";
import { Container, Sprite, Texture, Ticker } from "pixi.js";
import { TweenManager } from "./TweenLogic/TweenManager";

export class SymbolSprite extends Container {
    sprite: Sprite;
    texture: Texture;
    constructor(sprite: Sprite) {
        super();

        this.sprite = sprite;
        this.texture = sprite.texture;


        this.sprite.anchor.set(0.5);
        this.addChild(this.sprite);
        this.sprite.scale.set(1.0);
    }



    public setPosition(x: number, y: number): void {
        this.position.set(x, y);
    }

    public changeTexture(texture: string): void {
        this.texture = Texture.from(texture);
        this.sprite.texture = Texture.from(texture);
    }


    public getTexture(): Texture {
        return this.texture;
    }


    public presentWinAnimation(): Promise<boolean> {
        const scale = { scale: this.sprite.scale.x };

        const tween = new Tween(scale)
            .to({ scale: 1.2 }, 250)
            .easing(Easing.Quadratic.Out)
            .yoyo(true)
            .repeat(1)
            .onUpdate(() => {
                this.sprite.scale.set(scale.scale);
            })
        tween.start();

        TweenManager.getInstance().AddTween(tween);

        return new Promise((resolve) => {
            tween.onComplete(() => {
                console.log('Pew pew');
                TweenManager.getInstance().RemoveTween(tween);
                resolve(true);
            });
        });
    }



    update(dt: number): void { }
}