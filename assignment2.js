import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

class Cube extends Shape {
    constructor() {
        super("position", "normal",);
        // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]);
        this.arrays.normal = Vector3.cast(
            [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
            [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
            [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
        // Arrange the vertices into a square shape in texture space too:
        this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
            14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);
    }
}


class Base_Scene extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        this.hover = this.swarm = false;
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            'cube': new Cube(),
        };

        // *** Materials
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
        };
    }

    display(context, program_state) {
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(0, 10, 30));
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: *** Values of vector or point lights.
        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
    }
}

export class Assignment2 extends Base_Scene {
    /**
     * This Scene object can be added to any display canvas.
     * We isolate that code so it can be experimented with on its own.
     * This gives you a very small code sandbox for editing a simple scene, and for
     * experimenting with matrix transformations.
     */
    constructor() {
        super();
        this.forward = 0;
        this.backward = 0;
        this.right = 0;
        this.left = 0;
        this.lane = [];
        this.speed = [];
        
        for (let i = 0; i < 50; i++) {
            let a = Math.random();
            if (a > 0.50){
                this.lane[i] = 1                
            }
            else {
                this.lane[i] = -1
            }
        }

        for (let i = 0; i < 50; i++) {
            let a = Math.random();
            this.speed[i] = a;
        }
    }

    make_control_panel(program_state) {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("W", ["y"], () => {
            this.forward += 2;
        });
        this.key_triggered_button("A", ["g"], () => {
            this.left += 2;
        });
        this.key_triggered_button("S", ["h"], () => {
            this.backward += 2;
        });
        this.key_triggered_button("D", ["j"], () => {
            this.right += 2;
        });
    }

    draw_box(context, program_state, model_transform) {
        const blue = hex_color("#1a9ffa");        
        let t = program_state.animation_time/1000;
        model_transform = Mat4.translation((this.right - this.left), (this.forward - this.backward), 0).times(model_transform);
        this.shapes.cube.draw(context, program_state, model_transform, 
                                  this.materials.plastic.override({color: blue}));
        return model_transform;
    }

    draw_scooter(context, program_state, model_transform, lane, dir, speed) {
        const yellow = hex_color("#ffff00");
        let t = program_state.animation_time/1000;
        model_transform = Mat4.translation(dir * (25 - 5 * speed * t), 2 * lane, 0);
        this.shapes.cube.draw(context, program_state, model_transform, 
                                  this.materials.plastic.override({color: yellow}));
        return model_transform;
    }
    
    display(context, program_state) {
        super.display(context, program_state);
        let model_transform = Mat4.identity();
        // Example for drawing a cube, you can remove this line if needed\
        let desired = Mat4.inverse(Mat4.translation((this.right - this.left), 10 + (this.forward - this.backward), 30).times(model_transform));
        program_state.set_camera(desired);
        model_transform = this.draw_box(context, program_state, model_transform);
        for (let i = 1; i < 51; i++) {
            if (i !== 5){
                let speed = this.speed[i];
                //console.log(speed);
                let dir = this.lane[i];
                //console.log(dir)
                model_transform = this.draw_scooter(context, program_state, model_transform, i, dir, speed);
            }
        }


        // TODO:  Draw your entire scene here.  Use this.draw_box( graphics_state, model_transform ) to call your helper.
    }
}