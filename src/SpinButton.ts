import { Container, Sprite, Texture } from "pixi.js";
import { EventBus, GameFlowEvents, PlayerEvents } from "./EventsLogic/EventsBus";
import { IdleState, SpinState } from "./index";

export class SpinButton extends Container {
    private button: Sprite;

    constructor() {
        super();

        this.button = Sprite.from("spin_btn_normal");
        this.button.anchor.set(0.5);
        this.addChild(this.button);

        EventBus.getInstance().subscribe(GameFlowEvents.STATE_CHANGED, (state: string) => {
            switch (state) {
                case IdleState.name:
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

                    this.toggleClickSpin(true);

                    break;
                case SpinState.name:
                    this.button.interactive = false;
                    this.button.texture = Texture.from("spin_btn_disabled");

                    this.button.off("pointerover", this.handleOnHover);
                    this.button.off("pointerout", this.handleOnHoverOut);

                    this.toggleClickSpin(false);

                    break;

                default:
                    break;
            }

        });


        this.button.on("rightclick", () => {
            EventBus.getInstance().publish(PlayerEvents.TOGGLE_CHEAT);
        });
    }

    private toggleClickSpin(active: boolean): void {
        this.button.interactive = active

        if (active) {
            this.button.on("click", this.handleClick);
            this.button.on("touchstart", this.handleClick);
        } else {
            this.button.off("click", this.handleClick);
            this.button.off("touchstart", this.handleClick);
        }
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