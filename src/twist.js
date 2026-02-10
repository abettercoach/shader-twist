import {e, v} from './evaluator.js';

class Uniform {
  constructor(name, glsl) {
    this._glsl = glsl;
    this._name = name;
    this._e = e(() => 0);
    this._lastVal = v(this._e);

    requestAnimationFrame(() => this._update());
  }

  _update() {
    let val = v(this._e);
    if (val !== this._lastVal) {
      this._lastVal = val;
      let shader = this._glsl.shader();
      if (shader) {
        shader.setUniform(this._name, val);
      }
    }

    requestAnimationFrame(() => this._update());
  }

  bind(f) {
    this._e = e(f);
  }
}

export function uniform(name) {
  return new Uniform(name);
}

export class GLSL {
  constructor(p5) {
    this._p5 = p5;
    this._layers = [];
    this._shader;
  }

  layers(ls) {
    this._layers = ls;
    return this;
  }

  _vert() {
    return `
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
  }

  _frag() {
    let macros = `
      #ifdef GL_ES
      precision mediump float;
      #endif
    `;

    let standard = `
      varying vec2 vTexCoord;
    `;

    let uniforms = `
      uniform vec2 u_resolution;
      ${this._uniform_lines}
    `;

    let lib = `
      float smoothen(float d1, float d2, float k) {
          return -log(exp(-k * d1) + exp(-k * d2)) / k;
      }

      float circle_sdf(vec2 st, vec2 p, float r) {
          if (r == 0.0) return 1.0;
          return distance(st, p) * 1.0/r;
      }

      float shape(float sdf) {
          float ae = 5. / u_resolution.y;
          return 1.0 - smoothstep(0.8, 0.8+ae, sdf);
      }

      float invert(float sdf) {
          return 1.0 - sdf;
      }

      vec3 hsv2rgb(vec3 c){
          vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
          vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
          return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }
    `;

    let main = `
      void main() {
        vec2 st = vTexCoord.xy;
        st.x *= u_resolution.x/u_resolution.y;
        
        st.y -= 0.5;
        st.x -= u_resolution.x/u_resolution.y/2.;
        
        vec4 color = vec4(1.0);
        
        ${this._main_lines}

        gl_FragColor = color;
      }
    `;

    return macros + standard + uniforms + lib + main;
  }

  _compile_layers() {
    this._uniform_lines = ``;
    this._main_lines = ``;

    for (let i = 0; i < this._layers.length; i++) {
      let l = this._layers[i];
      
      l.bind_uniforms(this, i);

      this._uniform_lines += l.uniform_lines(i);
      this._main_lines += l.lines(i);

      let mix_line = `
      color = mix(color, l${i}_color, l${i}_sdf);
      `;
      this._main_lines += mix_line;
    }
  }

  compile() {
    this._compile_layers();

    console.log(this._frag());

    this._shader = this._p5.createShader(this._vert(), this._frag());
    this._p5.shader(this._shader);

    this._shader.setUniform('u_resolution', [this._p5.width, this._p5.height]);
  }

  shader() {
    return this._shader;
  }

  layer() {
    return new Layer(this);
  }

  uniform(name) {
    return new Uniform(name, this);
  }
}

class Layer {
  constructor() {
    this._uniforms = {
      // rgb: {
      //   type: `vec3`,
      //   sym: `rgb`,
      //   val: () => [1.0, 0.0, 0.0]
      // },
      hsv: {
        type: `vec3`,
        sym: `hsv`,
        val: () => [1.0, 0.0, 0.0]
      }
    }
    this._sublayers = [];
  }

  // rgb(f) {
  //   this._uniforms.rgb.val = e(f);
  //   return this;
  // }
  
  hsv(f) {
    this._uniforms.hsv.val = e(f);
    return this;
  }

  bind_uniforms(glsl, id) {
    let sub_id = 0;
    for (let sub of this._sublayers) {
      sub.bind_uniforms(glsl, `${id}_s${sub_id}`);
      sub_id++;
    }
    for (const u of Object.values(this._uniforms)){
      let sym = `l${id}_${u.sym}`;
      glsl.uniform(sym).bind(u.val);
    }
  }

  uniform_lines(id) {
    let sub_id = 0;
    let sublines = ``;
    for (let sub of this._sublayers) {
      sublines += sub.uniform_lines(`${id}_s${sub_id}`);
      sub_id++;
    }

    let lines = sublines;
    for (const u of Object.values(this._uniforms)){
      let sym = `l${id}_${u.sym}`;
      lines += `
      uniform ${u.type} ${sym};`
    }
    return lines;
  }

  lines(id) {
    return `
      float l${id}_sdf = 1.0;
      vec4 l${id}_color = vec4(hsv2rgb(l${id}_hsv), 1.0);
    `;
  }

  display(glsl) {
    glsl.layers([this]);
    glsl.compile();
  }
}

export function layer() {
  return new Layer();
}

class Sdf {
  constructor() {

  }
}

class Shape extends Layer {
  constructor() {
    super();
  }
}

class Circle extends Shape {
  constructor() {
    super();
    this._uniforms.x = {
      type: `float`,
      sym: `x`,
      val: () => 0.0
    };
    this._uniforms.y = {
      type: `float`,
      sym: `y`,
      val: () => 0.0
    };
    this._uniforms.r = {
      type: `float`,
      sym: `r`,
      val: () => 0.5
    };
    this._uniforms.toggle = {
      type: `bool`,
      sym: `toggle`,
      val: () => true
    };
  }

  x(f) {
    this._uniforms.x.val = e(f);
    return this;
  }

  y(f) {
    this._uniforms.y.val = e(f);
    return this;
  }

  r(f) {
    this._uniforms.r.val = e(f);
    return this;
  }

  toggle(f) {
    this._uniforms.toggle.val = e(f);
    return this;
  }

  sdf(id) {
    return `l${id}_toggle ? circle_sdf(st, vec2(l${id}_x,l${id}_y), l${id}_r): 1000.0`
  }

  lines(id) {
    return `
      float l${id}_sdf = shape(${this.sdf(id)});
      vec4 l${id}_color = vec4(hsv2rgb(l${id}_hsv), l${id}_toggle);
    `;
  }
}

export function circle() {
  return new Circle();
}

class Glob extends Shape {
  constructor() {
    super();
    this._shapes = [];
    this._uniforms.k = {
      type: `float`,
      sym: `k`,
      val: () => 0.0
    };
    this._uniforms.toggle = {
      type: `bool`,
      sym: `toggle`,
      val: () => true
    };
  }

  k(f) {
    this._uniforms.k.val = e(f);
    return this;
  }

  shapes(shapes) {
    this._shapes = shapes;
    this._sublayers = shapes;
    return this;
  }

  sdf(id) {
    let sdf_str = '1000.0';
    let sub_id = 0; //inner layer
    for (let shape of this._shapes) {
      sdf_str = `smoothen(${shape.sdf(`${id}_s${sub_id}`)}, ${sdf_str}, l${id}_k)`;
      sub_id++;
    }
    return sdf_str;
  }

  lines(id) {
    return `
      float l${id}_sdf = shape(${this.sdf(id)});
      vec4 l${id}_color = vec4(hsv2rgb(l${id}_hsv), l${id}_toggle);
    `;
  }
}

export function glob() {
  return new Glob();
}

