import { Container, Sprite } from "pixi.js";

export class SymbolSprite extends Container {
    sprite: Sprite;
    constructor(Sprite: Sprite) {
        super();

        this.sprite = Sprite;
        this.sprite.anchor.set(0.5);
        this.addChild(this.sprite);
        this.sprite.scale.set(0.7);
    }



    public setPosition(x: number, y: number): void {
        this.position.set(x, y);
    }





    update(dt: number): void { }
}