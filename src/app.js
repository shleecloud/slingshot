import * as Matter from 'matter-js';

export default class App {
    matterContainer = document.querySelector('body');

    dpr = window.devicePixelRatio > 1 ? 2 : 1;
    THICKNESS = 60;
    engine = Matter.Engine.create();
    runner = Matter.Runner.create();
    render = Matter.Render.create({
        element: this.matterContainer,
        engine: this.engine,
        options: {
            width: innerWidth,
            height: innerHeight,
            background: 'transparent',
            wireframes: true,
            showAngleIndicator: true,
        },
    });

    constructor() {
        Matter.Render.run(this.render);
        Matter.Runner.run(this.runner, this.engine);
    }

    init() {
        this.box = Matter.Bodies.rectangle(200, 200, 80, 80);
        this.ground = Matter.Bodies.rectangle(
            this.matterContainer.clientWidth / 2,
            this.matterContainer.clientHeight - this.THICKNESS / 2,
            this.matterContainer.clientWidth,
            this.THICKNESS,
            {
                isStatic: true,
            },
        );
        Matter.Composite.add(this.engine.world, [this.box, this.ground]);

        window.addEventListener('resize', () => {
            this.render.canvas.width = this.matterContainer.clientWidth; // this.matterContainer.clientWidth;
            this.render.canvas.height = this.matterContainer.clientHeight; //this.matterContainer.clientHeight;
            Matter.Body.setPosition(
                this.ground,
                Matter.Vector.create(
                    this.matterContainer.clientWidth / 2,
                    this.matterContainer.clientHeight - this.THICKNESS / 2,
                ),
            );
        });
    }
}
