class OutcomePicker {
    constructor(private outcomes: string[][][]) { }

    private lastOutcomeIndex: number = -1;

    getOutcome(): string[][] {
        let randomIndex = Math.floor(Math.random() * this.outcomes.length);
        while (randomIndex === this.lastOutcomeIndex) {
            randomIndex = Math.floor(Math.random() * this.outcomes.length);
        }
        this.lastOutcomeIndex = randomIndex;
        return this.outcomes[randomIndex];
    }

    public getByindex(index: number): string[][] {
        return this.outcomes[index];
    }
}


export class Outcome {
    constructor() { }

    static resolve(): string[][] {
        const columns = 5;
        const rows = 3;
        const symbols = ["high1", "high2", "high3", "low1", "low2", "low3", "low4"];

        const outcome: string[][] = [];
        for (let i = 0; i < columns; i++) {
            const column = [];
            for (let j = 0; j < rows; j++) {
                column.push(symbols[Math.floor(Math.random() * symbols.length)]);
            }
            outcome.push(column);
        }
        return outcome;
    }


    static winOutcomes = new OutcomePicker([
        [
            ["low2", "low3", "high1"],
            ["high1", "high2", "high1"],
            ["high2", "high1", "high1"],
            ["high2", "high2", "low4"],
            ["low3", "high3", "low4"]
        ],
        [
            ["high1", "high1", "high1"],
            ["high1", "high2", "high1"],
            ["high2", "high1", "high1"],
            ["high2", "high2", "low4"],
            ["low3", "high3", "low4"]
        ],
        [
            ["high3", "high3", "high3"],
            ["high3", "high3", "high3"],
            ["high3", "high3", "high3"],
            ["high3", "high3", "high3"],
            ["high3", "high3", "high3"]
        ],
        [
            ["high3", "high1", "low3"],
            ["high3", "low3", "high1"],
            ["high3", "high1", "low3"],
            ["low4", "high3", "high3"],
            ["low3", "low1", "high2"]
        ],
        [
            ["high2", "low1", "high3"],
            ["high2", "low3", "low4"],
            ["low1", "low4", "high2"],
            ["low3", "high3", "high2"],
            ["high2", "high2", "high1"]
        ]
    ]);

    static pickFromRandomWinOutcomes(): string[][] {
        return Outcome.winOutcomes.getOutcome();
    }
}

