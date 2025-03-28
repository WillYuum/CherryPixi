// /**
//  * This system should help in splitting game logic from PixiJS rendering logic.
//  */

// import { Container, ViewContainer } from "pixi.js";


// /**
//  *  Base class for all components which will allow to add game logic in
//  *  Example: ReelRender, SpinRender, WinRender
//  */
// export class Component {
//     gameObject: GameObject;

//     constructor() {
//         ComponentManager.getInstance().addComponent(this);
//     }

//     awake() {

//     }

//     update(deltaTime: number) {
//     }
// }



// /**
//  * GameObject class is a container for components and visual components.
//  * This class will help to keep game and rendering logic separate
//  * but still accessible to each other.
//  *
//  * Each GameObject will need a holder so if it had visual components,
//  * it can be added to the stage and be rendered.
//  */
// export class GameObject {
//     name: string;
//     components: Component[] = [];
//     viewComponents: ViewContainer[] = [];
//     holder: Container;

//     constructor(name: string, parent: Container) {
//         this.name = name;
//         this.holder = new Container();
//         parent.addChild(this.holder);
//     }


//     addComponent<T extends Component>(component: T): T {
//         this.components.push(component);

//         component.gameObject = this;

//         return component;
//     }

//     getComponent<T extends Component>(componentClass: new (...args: any[]) => T): T | undefined {
//         return this.components.find(c => c instanceof componentClass) as T | undefined;
//     }

//     removeComponent(component: Component): Boolean {
//         const index = this.components.indexOf(component);
//         if (index !== -1) {
//             ComponentManager.getInstance().removeComponent(component);
//             this.components.splice(index, 1);
//             return true;
//         }

//         return false;
//     }

//     addVisualComponent<T extends ViewContainer>(viewComponent: T): T {
//         this.viewComponents.push(viewComponent);
//         this.holder.addChild(viewComponent);
//         return viewComponent;
//     }

//     getVisualComponent<T extends ViewContainer>(componentClass: new (...args: any[]) => T): T | undefined {
//         return this.viewComponents.find(vc => vc instanceof componentClass) as T | undefined;
//     }

//     removeVisualComponent(viewComponent: ViewContainer): void {
//         const index = this.viewComponents.indexOf(viewComponent);
//         if (index !== -1) {
//             this.viewComponents.splice(index, 1);
//         }
//     }

// }





// /**
//  * ComponentManager is a singleton class which will manage all the important parts
//  * in the components so they can run as expected.
//  * These parts are:
//  * 1. Awake all components
//  * 2. Update all components
//  * 3. Add components
//  * 4. Remove components
//  */
// export class ComponentManager {
//     private static instance: ComponentManager;
//     private components: Set<Component> = new Set();

//     // Private constructor to prevent direct instantiation
//     private constructor() { }

//     // Get the singleton instance
//     static getInstance() {
//         if (!this.instance) {
//             this.instance = new ComponentManager();
//         }
//         return this.instance;
//     }

//     awakeComponents() {
//         for (let component of this.components) {
//             component.awake();
//         }
//     }

//     // Register a component for updating
//     addComponent(component: Component) {
//         this.components.add(component);
//     }

//     // Remove a component when it's no longer needed
//     removeComponent(component: Component) {
//         this.components.delete(component);
//     }

//     // Update all components
//     updateComponents(deltaTime: number) {
//         for (let component of this.components) {
//             component.update(deltaTime);
//         }
//     }
// }
