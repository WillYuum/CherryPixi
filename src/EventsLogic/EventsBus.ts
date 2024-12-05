export class EventBus {
    private static instance: EventBus;
    private events: Map<string, Array<Function>> = new Map();

    private constructor() { }

    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    public subscribe(event: string, callback: Function): void {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event)!.push(callback);
    }

    public subscribeOnce(event: string, callback: Function): void {
        const onceCallback = (...args: any[]) => {
            callback(...args);
            this.unsubscribe(event, onceCallback);
        };
        this.subscribe(event, onceCallback);
    }

    public unsubscribe(event: string, callback: Function): void {
        const callbacks = this.events.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    public publish(event: string, ...args: any[]): void {
        const callbacks = this.events.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(...args));
        }
    }
}



export enum PlayerEvents {
    PRESS_SPIN = "Press_Spin",
    TOGGLE_CHEAT = "Toggle_Cheat",
}

export enum GameFlowEvents {
    STATE_CHANGED = "State_Changed",
}