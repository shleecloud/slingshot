import * as Matter from 'matter-js';
// import Platform from './platform';

export default class App {
    constructor() {
        this.matterContainer = document.querySelector('body');
        // * init static values
        this.canvasWidth = 1024;
        this.canvasHeight = 576;
        this.thickness = 60;

        // * init matter-js
        this.engine = Matter.Engine.create();
        this.runner = Matter.Runner.create();
        this.render = Matter.Render.create({
            element: this.matterContainer,
            engine: this.engine,
            options: {
                width: this.canvasWidth,
                height: this.canvasHeight,
                background: 'transparent',
                wireframes: true,
                showAngleIndicator: false,
            },
        });
        Matter.Render.run(this.render);
        Matter.Runner.run(this.runner, this.engine);
    }

    run() {
        this.createObject();
        this.createSlingshotEvents();
    }

    createObject() {
        // * 지면 만들기
        this.ground = Matter.Bodies.rectangle(
            this.canvasWidth / 2,
            this.canvasHeight - this.thickness / 2,
            this.matterContainer.clientWidth,
            this.thickness,
            {
                isStatic: true,
            },
        );

        // * 플랫폼 만들기
        this.platformUp = Matter.Bodies.rectangle(
            (this.canvasWidth * 2.2) / 3,
            (this.canvasHeight * 1.2) / 3,
            this.matterContainer.clientWidth / 9,
            this.thickness / 5,
            {
                isStatic: true,
            },
        );
        this.platformDown = Matter.Bodies.rectangle(
            (this.canvasWidth * 2.2) / 3,
            (this.canvasHeight * 2) / 3,
            this.matterContainer.clientWidth / 4,
            this.thickness / 5,
            {
                isStatic: true,
            },
        );

        // * 더미 송편 만들기
        this.pyramid = Matter.Composites.pyramid(500, 300, 9, 10, 0, 0, function (x, y) {
            return Matter.Bodies.rectangle(x, y, 25, 40);
        });

        // * 물리엔진에 추가
        Matter.Composite.add(this.engine.world, [this.ground, this.platformDown, this.platformUp, this.pyramid]);
    }

    createSlingshotEvents() {
        // * 슬링샷 돌맹이 만들기
        this.rock = Matter.Bodies.polygon(170, 450, 8, 20, { density: 0.004 });
        this.elastic = Matter.Constraint.create({
            pointA: { x: 170, y: 450 },
            bodyB: this.rock,
            stiffness: 0.05,
            length: 0.01,
            damping: 0.01,
        });

        // * 마우스
        this.mouse = Matter.Mouse.create(this.render.canvas);
        this.mouseConstraint = Matter.MouseConstraint.create(this.engine, {
            mouse: this.mouse,
            constraint: {
                stiffness: 0.2,
            },
            render: {
                visible: false,
            },
        });

        // * 마우스 이벤트
        Matter.Events.on(this.engine, 'afterUpdate', () => {
            if (this.mouseConstraint.mouse.button === -1 && (this.rock.position.x > 190 || this.rock.position.y < 430)) {
                this.rock = Matter.Bodies.polygon(170, 450, 8, 20, { density: 0.004 });
                Matter.Composite.add(this.engine.world, this.rock);
                this.elastic.bodyB = this.rock;
            }
        });

        // todo 슬링샷이 발사된 돌맹이는 클릭 이벤트가 해지된다

        // todo 발사되고 1초 후에 돌맹이는 사라진다

        // * 물리엔진에 추가
        Matter.Composite.add(this.engine.world, [this.elastic, this.rock, this.mouseConstraint]);
        this.render.mouse = this.mouse;
    }

    // todo 모든 표적이 플랫폼에서 떨어졌는지 확인한다
    // todo 표적이 모두 떨어지면 발사한 횟수를 로컬 스토리지에 기록한다
}
