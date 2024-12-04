import { Container, Sprite, Texture } from "pixi.js";

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




    update(dt: number): void { }
}