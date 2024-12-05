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

        const durationInSeconds = 0.25;

        const tween = new Tween(scale)
            .to({ scale: 1.2 }, durationInSeconds * 1000)
            .easing(Easing.Cubic.Out)
            .yoyo(true)
            .repeat(1)
            .onUpdate(() => {
                this.sprite.scale.set(scale.scale);
            })
        tween.start();

        TweenManager.getInstance().AddTween(tween);

        return new Promise((resolve) => {
            tween.onComplete(() => {
                TweenManager.getInstance().RemoveTween(tween);
                resolve(true);
            });
        });
    }

    public presentLoseAnimation(): Promise<boolean> {
        const color = { r: 1, g: 1, b: 1 };

        const durationInSeconds = 0.25;

        const tween = new Tween(color)
            .to({ r: 0.15, g: 0.15, b: 0.15 }, durationInSeconds * 1000)
            .onUpdate(() => {
                this.sprite.tint = this.rgbToTint(color);
            });

        tween.start();

        TweenManager.getInstance().AddTween(tween);

        return new Promise((resolve) => {
            tween.onComplete(() => {

                this.sprite.tint = this.rgbToTint({ r: 0.15, g: 0.15, b: 0.15 });

                TweenManager.getInstance().RemoveTween(tween);
                resolve(true);
            });
        });
    }

    public resetColor(): Promise<boolean> {
        const color = { r: 1, g: 1, b: 1 };

        const durationInSeconds = 0.25;

        const tween = new Tween(color)
            .to({ r: 1, g: 1, b: 1 }, durationInSeconds * 1000)
            .easing(Easing.Cubic.Out)
            .onUpdate(() => {
                this.sprite.tint = this.rgbToTint(color);
            });

        tween.start();

        TweenManager.getInstance().AddTween(tween);

        return new Promise((resolve) => {
            tween.onComplete(() => {

                this.sprite.tint = this.rgbToTint({ r: 1, g: 1, b: 1 });

                TweenManager.getInstance().RemoveTween(tween);
                resolve(true);
            });
        }
        );
    }




    /**
 * Converts an RGB color object to a PIXI tint value.
 * @param rgb - The RGB color object with values between 0 and 1.
 * @returns A number representing the PIXI tint value.
 */
    private rgbToTint(rgb: { r: number; g: number; b: number }): number {
        return Math.round(rgb.r * 255) * 65536 // Convert red
            + Math.round(rgb.g * 255) * 256   // Convert green
            + Math.round(rgb.b * 255);       // Convert blue
    }



    update(dt: number): void { }
}