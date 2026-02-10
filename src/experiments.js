
const std_vert = `
    // Standard shader from https://p5js.org/tutorials/intro-to-shaders/
    precision highp float;
    attribute vec3 aPosition;
    attribute vec2 aTexCoord;
    attribute vec4 aVertexColor;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying vec2 vTexCoord;
    varying vec4 vVertexColor;

    void main() {
      // Apply the camera transform
      vec4 viewModelPosition = uModelViewMatrix * vec4(aPosition, 1.0);

      // Tell WebGL where the vertex goes
      gl_Position = uProjectionMatrix * viewModelPosition;

      // Pass along data to the fragment shader
      vTexCoord = aTexCoord;
      vVertexColor = aVertexColor;
    }
`;

const std_frag_macros = `
    #ifdef GL_ES
    precision mediump float;
    #endif
`;

const std_frag_uniforms = `
    varying vec2 vTexCoord;
    uniform vec2 u_resolution;
`;

const std_frag_lib = `
`;

export function twist(p5) {
    return new Twist(p5);
}

class Twist {
    constructor(p5) {
        this._p5 = p5;

        this._calls = [];
        this._main_monitor = new Monitor();
    }

    monitor() {
        return this._main_monitor;
    }

    run() {
        const [vert, frag] = this.build_script();
        console.log(frag);

        this._shader = this._p5.createShader(vert, frag);
        
        this._p5.shader(this._shader);
        this._shader.setUniform('u_resolution', [this._p5.width, this._p5.height]);

        this.bind_uniforms(this._shader);
    }

    build_script() {
        const main = this.build_main();
        const glsl_vert = std_vert;
        const glsl_frag = std_frag_macros + std_frag_uniforms + std_frag_lib + main;
        return [glsl_vert, glsl_frag];
    }

    build_main() {
        const call = this._main_monitor.build();
        return `
    void main() {
        vec2 st = vTexCoord.xy;
        st.x *= u_resolution.x/u_resolution.y;
        
        st.y -= 0.5;
        st.x -= u_resolution.x/u_resolution.y/2.;

        vec4 color = ${call};
        gl_FragColor = color;
    }
`
    }

    bind_uniforms() {

    }

}

class Monitor {
    constructor() {
        this._calls = [];
    }

    mix(color, shaper) {
        const prev = this.build();
        this.build = () => `
    mix(${prev}, ${color.build()}, ${b(shaper).build()})
`;
    }

    build() {
        return `vec4(0., 0., 0., 1.)`;
    }
}

class Color {
    constructor(r = 0, g = 0, b = 0, a = 1) {
        this._r = r;
        this._b = b;
        this._g = g;
        this._a = a;
    }

    build() {
        return `vec4(${this._r}, ${this._g}, ${this._b}, ${this._a})`;
    }
}

export function rgba(r,g,b,a) {
    return new Color(r,g,b,a);
}

class Builder {
    constructor(o) {
        if (typeof o === 'number') {
            this.build = () => o.toFixed(2);
        }
    }

    build() {
        return ``;
    }
}

function b(o) {
    return new Builder(o);
}




// function defFunction(funcObj) {
//     // Add func to glsl library

//     // Return callable function that adds to the glsl object
//     return () => {
//         glsl.addCall
//     }
// }

// const circle = defFunction({
//     name: 'circle',
//     type: 'field',
//     inputs: [
//         {
//             type: 'float',
//             name: 'x',
//             default: 0
//         },
//         {
//             type: 'float',
//             name: 'y',
//             default: 0
//         },
//         {
//             type: 'float',
//             name: 'r',
//             default: 0.5
//         }
//     ],
//     glsl:
//     `   if (r == 0.0) return 1.0;
//         return distance(st, p) * 1.0/r;
//     `
// });

// defFunction({
//     name: 'shape',
//     type: 'shaping',
//     glsl:
//     `   float ae = 5. / u_resolution.y;
//         return 1.0 - smoothstep(0.8, 0.8+ae, t);
//     `
// })

// defFunction({
//     name: 'mix',
//     type: 'color',
//     glsl:
//     `   
//     `
// })

//white.mix(red, circle.shape)

//screen().fill(hex('######')))

//run() <- Compile glsl