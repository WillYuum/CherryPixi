import { Container, Sprite } from "pixi.js";

export class SpinButton extends Container {
    constructor() {
        super();

        const button = Sprite.from("spin_btn_normal");
        button.anchor.set(0.5);
        this.addChild(button);

        this.interactive = true;
        this.onclick = this.handleClick;
    }


    public setPosition(x: number, y: number): void {
        this.position.set(x, y);
    }


    private handleClick(): void {
        console.log("Spin button clicked");
    }

    update(dt: number): void { }
}