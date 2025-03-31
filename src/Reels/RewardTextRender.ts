import { Component } from "@willyuum/pixi-gameobject-system";
import { ReelRender } from "./ReelRender";
import { SymbolTypeResult } from "./types";
import { Graphics, Text } from "pixi.js";


export class RewardTextRender extends Component {
    private textTrackers: Text[] = [];


    public RenderRewardText(symbolTypeResult: SymbolTypeResult): void {
        if (symbolTypeResult.isWin == false) {
            throw new Error("SymbolTypeResult should be a win to render reward text");
        }


        const reelRender = this.gameObject.getComponent(ReelRender);

        const convertedToWorldSpace = symbolTypeResult.cellPositions.map(cellPosition => {
            return reelRender.GetPostionOnReelFromCellPosition(cellPosition);
        });

        const { x, y } = this.getAlignedTextToSymbols(convertedToWorldSpace);

        const text = this.createText("1000");

        text.position.set(x, y);

        setTimeout(() => {
            text.visible = false;
            this.gameObject.removeVisualComponent(text);
            text.destroy();
        }, 3500);


    }


    private getAlignedTextToSymbols(symPosition: {
        x: number;
        y: number;
    }[]): { x: number, y: number } {
        const textPosition = { x: 0, y: 0 };

        symPosition.forEach((cellPosition, index) => {

            textPosition.x += cellPosition.x;
            textPosition.y += cellPosition.y;
        });

        textPosition.x = textPosition.x / symPosition.length;
        textPosition.y = textPosition.y / symPosition.length;

        return textPosition;
    }

    private createText(text: string) {
        const colorWin = 0x00FF00;
        const textObject = new Text(text, { fill: colorWin, fontSize: 35 });
        this.gameObject.addVisualComponent(textObject);

        this.textTrackers.push(textObject);

        textObject.anchor.set(0.5);

        textObject.zIndex = 500;

        return textObject;
    }
}