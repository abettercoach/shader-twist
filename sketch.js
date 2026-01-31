// by iris enrique
// Midi Controlled Shader
// Elektron Digitakt | Proj "Shaders" Bnk A 

let myShader;

let MIDIChs = Array.from({
    length: 16
  }, _ => ({
    cc: Array(128).fill(0.5)
  }));
let velocity = 0;

function preload() {
  myShader = loadShader('./shader.vert', './shader.frag');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  shader(myShader);

  WebMidi.enable().then(() => {
    let digitakt = WebMidi.getInputByName("Elektron Digitakt");
    if (!digitakt) {
      console.log("Digitakt not found");
      return;
    }

    digitakt.addListener("controlchange", e => {
      let ch = e.message.channel;
      let cc = e.controller.number;
      let v = e.value;
      MIDIChs[ch].cc[cc] = v;
    });

    deepSetup();
  });

  myShader.setUniform('u_resolution', [width, height]);
}

function draw() {
  noStroke();

  // apply the shader to a rectangle taking up the full canvas
  plane(width, height);
}

function deepSetup() {

  let tempo = midi().ch(1).cc(1).range(-1,1).map((x) => {
    let y = Math.pow(Math.cos(PI * x / 2), 2);
    if (x < 0) {
      y = y - 1;
    } else {
      y = 1 - y;
    }
    return y / 5;
  });

  let mainPhaser = phaser();
  mainPhaser.vel(new Evaluator(() => (tempo.value() * 0.1)));
  mainPhaser.min(midi().ch(1).cc(2).range(0.5,2));
  mainPhaser.max(midi().ch(1).cc(3).range(2,10));

  let u_radius = uniform('u_radius');
  u_radius.bind(mainPhaser);

  let t = clock();
  t.vel(tempo);

  let u_time = uniform('u_time');
  u_time.bind(t);

  let u_background = uniform('u_background');
  u_background.bind(new Evaluator(() => {
    let bg = [0,0,0];
    bg[0] = midi().ch(1).cc(4).value();
    bg[1] = midi().ch(1).cc(5).value();
    bg[2] = midi().ch(1).cc(6).value();
    console.log(bg);
    return bg;
  }));

  let u_k = uniform('u_k');
  u_k.bind(midi().ch(1).cc(7).range(0.5,10));

  // let u_circles = uniform('u_circles');
  // for (let i = 0; i < 7; i++) {
  //   let ch = i + 10;
  //   let u = u_circles[i];

  //   let xPhaser = phaser();
  //   xPhaser.vel = clock.vel;
  //   xPhaser.min(midi().ch(ch).cc(1));
  //   xPhaser.max(midi().ch(ch).cc(2));

  //   let yPhaser = phaser();
  //   yPhaser.vel = clock.vel;
  //   yPhaser.min(midi().ch(ch).cc(3));
  //   yPhaser.max(midi().ch(ch).cc(4));

  //   let rPhaser = phaser();
  //   rPhaser.vel = clock.vel;
  //   rPhaser.min(midi().ch(ch).cc(5));
  //   rPhaser.max(midi().ch(ch).cc(5));

  //   let circle = circle();
  //   circle.x(xPhaser);
  //   circle.y(yPhaser);
  //   circle.r(rPhaser);

  //   u[0].bind(circle.x);
  //   u[1].bind(circle.y);
  //   u[2].bind(circle.r);
  //   u[3].bind(midi().ch(ch).cc(94));
  // }
}

class Evaluator {
  constructor(fn) {
    this._fn = fn;
  }

  value() {
    return this._fn();
  }

  range(min, max) {
    //Assuming we'll only call range
    //on an evaluator that currently goes 
    //from 0 to 1.
    return new Evaluator(() => {
      let val = this._fn();
      return val * (max - min) + min;
    });
  }

  map(f) {
    return new Evaluator(() => {
     return  f(this._fn());
    });
  }
}

function clock() {
  let _phase = 0.0;
  let _vel = new Evaluator(() => 0);
  let _update = () => {
    _phase += _vel.value();
    requestAnimationFrame(_update);
  };

  let o = {
    vel: (o) => {
      _vel = o;
    },
    value: () => {
      return _phase;
    }
  };
  requestAnimationFrame(_update);

  return o;
}

function phaser() {
  let _phase = 0.0;
  let _vel = new Evaluator(() => 0);
  let _min = new Evaluator(() => -1);
  let _max = new Evaluator(() => 1);
  let _update = () => {
    _phase += _vel.value();
    requestAnimationFrame(_update);
  };

  let o = {
    vel: (o) => {
      _vel = o;
    },
    min: (o) => {
      _min = o;
    },
    max: (o) => {
      _max = o;
    },
    value: () => {
      let max = _max.value();
      let min = _min.value();
      let amp = (max - min) / 2;
      let mid = (max + min) / 2;
      let v = amp * Math.sin(_phase) + mid;
      console.log(max, min, amp, mid, v);
      return v;
    }
  };
  requestAnimationFrame(_update);

  return o;
}

function midi() {
  let o = {
    ch: (n_ch) => {
      return {
        cc: (n_cc) => {
          return new Evaluator(() => {
            return Math.round(MIDIChs[n_ch].cc[n_cc] * 100)/100;
          });
        }
      }
    }
  };

  return o;
}

function uniform(name) {
  let _evaluator = new Evaluator(() => 0.0);
  let _update = () => {
    let v = _evaluator.value();
    console.log(name, v);
    myShader.setUniform(name, v);
    requestAnimationFrame(_update);
  };

  let o = {
    bind: (evaluator) => {
      _evaluator = evaluator;
    }
  };
  requestAnimationFrame(_update);

  return o;
}