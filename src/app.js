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
                wireframes: false,
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
        const staticCategory = 0x0002;

        // * 지면 만들기
        // this.ground = Matter.Bodies.rectangle(
        //     this.canvasWidth / 2,
        //     this.canvasHeight - this.thickness / 2 + this.thickness,
        //     this.matterContainer.clientWidth,
        //     this.thickness,
        //     {
        //         isStatic: true,
        //     },
        // );

        // * 플랫폼 만들기
        this.platformUp = Matter.Bodies.rectangle(750, 200, 150, this.thickness / 5, {
            isStatic: true,
            label: 'platform',
            collisionFilter: {
                category: staticCategory,
            },
        });
        this.platformDown = Matter.Bodies.rectangle(750, 400, 250, this.thickness / 5, {
            isStatic: true,
            label: 'platform',
            collisionFilter: {
                category: staticCategory,
            },
        });

        // * 벽 만들기
        this.wall = Matter.Bodies.rectangle(450, 490, this.thickness / 5, 220, {
            isStatic: true,
            label: 'platform',
            collisionFilter: {
                category: staticCategory,
            },
        });

        // * 타겟 송편 만들기
        this.pyramidUp = Matter.Composites.pyramid(662, 270, 6, 4, 0, 0, function (x, y) {
            return Matter.Bodies.trapezoid(x, y, 30, 30, 0.33, {
                label: 'target',
                collisionFilter: {
                    category: staticCategory,
                },
            });
        });

        this.pyramidDown = Matter.Composites.pyramid(690, 100, 4, 4, 0, 0, function (x, y) {
            return Matter.Bodies.trapezoid(x, y, 30, 30, 0.33, {
                label: 'target',
                collisionFilter: {
                    category: staticCategory,
                },
            });
        });

        // * 물리엔진에 추가
        Matter.Composite.add(this.engine.world, [
            // this.ground,
            this.wall,
            this.platformUp,
            this.platformDown,
            this.pyramidUp,
            this.pyramidDown,
        ]);
    }

    createSlingshotEvents() {
        const staticCategory = 0x0002,
            interactCategory = 0x0001;
        // * 슬링샷 돌맹이 만들기
        this.rock = Matter.Bodies.polygon(170, 450, 10, 20, { density: 0.01, label: 'rock' });
        this.rock.collisionFilter.category = interactCategory;
        this.elastic = Matter.Constraint.create({
            pointA: { x: 170, y: 450 },
            bodyB: this.rock,
            stiffness: 0.9,
            damping: 0.1,
            length: 0.5,
        });

        // * 마우스
        this.mouse = Matter.Mouse.create(this.render.canvas);
        this.mouseConstraint = Matter.MouseConstraint.create(this.engine, {
            mouse: this.mouse,
            collisionFilter: {
                mask: interactCategory,
            },
            constraint: {
                stiffness: 0.2,
            },
            render: {
                visible: false,
            },
        });

        let firing = false;
        Matter.Events.on(this.mouseConstraint, 'enddrag', function (event) {
            if (event.body.label !== 'rock') return;
            event.body.label = 'released rock';
            firing = true;
            event.body.collisionFilter.category = staticCategory;
        });
        Matter.Events.on(this.engine, 'afterUpdate', () => {
            if (firing && (Math.abs(this.rock.position.x - 170) < 10 || Math.abs(this.rock.position.y - 430) < 10)) {
                this.rock = Matter.Bodies.polygon(170, 450, 10, 20, {
                    density: 0.01,
                    label: 'rock',
                    collisionFilter: { category: interactCategory },
                });
                Matter.Composite.add(this.engine.world, this.rock);
                this.elastic.bodyB = this.rock;
                firing = false;
            }

            // todo 모든 표적이 플랫폼에서 떨어졌는지 확인한다
            // * 지면을 삭제하고 타겟과 돌맹이가 canvasHeight 아래로 내려가면 객체를 삭제한다
            // console.log(this.engine.world);
            this.engine.world.composites.forEach((body) => {
                if (body.label === 'target' && body.position.y > this.canvasHeight) {
                    Matter.Composite.remove(this.engine.world, body);
                }
                // if (body.label === 'rock' && body.position.y > this.canvasHeight) {
                //     Matter.Composite.remove(this.engine.world, body);
                // }
            });

            // todo 표적이 모두 떨어지면 발사한 횟수를 로컬 스토리지에 기록한다
        });

        // * 물리엔진에 추가
        Matter.Composite.add(this.engine.world, [this.elastic, this.rock, this.mouseConstraint]);
        this.render.mouse = this.mouse;
    }
}
