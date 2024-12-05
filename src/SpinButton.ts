import { Container, Sprite, Texture } from "pixi.js";
import { EventBus, GameFlowEvents, PlayerEvents } from "./EventsLogic/EventsBus";
import { GameStates } from "..";

export class SpinButton extends Container {
    private button: Sprite;

    constructor() {
        super();

        this.button = Sprite.from("spin_btn_normal");
        this.button.anchor.set(0.5);
        this.addChild(this.button);

        EventBus.getInstance().subscribe(GameFlowEvents.STATE_CHANGED, (state: string) => {
            switch (state) {
                case GameStates.IDLE:
                    this.button.interactive = true;
                    this.button.texture = Texture.from("spin_btn_normal");

                    var isHover = true;

                    this.button.on("pointerover", () => {
                        isHover = true;
                        if (isHover) this.handleOnHover();
                    });

                    this.button.on("pointerout", () => {
                        isHover = false;
                        this.handleOnHoverOut();
                    });

                    this.button.on("click", this.handleClick);

                    break;
                case GameStates.SPINNING:
                    this.button.interactive = false;
                    this.button.texture = Texture.from("spin_btn_disabled");

                    this.button.off("pointerover", this.handleOnHover);
                    this.button.off("pointerout", this.handleOnHoverOut);

                    this.button.off("click", this.handleClick);

                    break;
            }

        });
    }


    public setPosition(x: number, y: number): void {
        this.position.set(x, y);
    }


    private handleClick(): void {
        EventBus.getInstance().publish(PlayerEvents.PRESS_SPIN);
    }


    private handleOnHover(): void {
        this.button.texture = Texture.from("spin_btn_over");
    }

    private handleOnHoverOut(): void {
        this.button.texture = Texture.from("spin_btn_normal");
    }




    update(dt: number): void { }
}