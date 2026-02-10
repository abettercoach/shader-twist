// by iris enrique
// Shader Twist
// Midi Controlled Shaders
// Elektron Digitakt | Proj "Shaders" Bnk A 

import {v, e} from '/src/evaluator.js'
import {phaser} from '/src/phaser.js'
import {midi} from '/src/midi.js'
import {GLSL, layer, glob, circle} from '/src/twist.js';


new p5((p) => {

  const glsl = new GLSL(p);
  let font;
  let code = false;

  p.preload = () => {
    font = p.loadFont("assets/LilitaOne-Regular.ttf");
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);

    const main = midi().ch(9);
    
    let tempo = main.cc(1).range(-1,1).easemid().scale(0.2);

    const ch10 = midi().ch(10);
    const ch11 = midi().ch(11);
    const ch12 = midi().ch(12);
    const ch13 = midi().ch(13);
    const ch14 = midi().ch(14);
    const ch15 = midi().ch(15);
    const ch16 = midi().ch(16);

    const glob_circle = (ch) => {
      return circle()
        .x(phaser().vel(tempo.scale(ch.cc(7).scale(4))).min(-0.5).max(0.5).offset(ch.cc(3).range(-Math.PI, Math.PI)))
        .y(phaser().vel(tempo.scale(ch.cc(8).scale(4))).min(-0.5).max(0.5).offset(ch.cc(4).range(-Math.PI, Math.PI)))
        .r(phaser().vel(tempo.scale(ch.cc(5).scale(4))).min(ch.cc(1).easemid()).max(ch.cc(2).easemid()))
        .toggle(ch.mute())
    }

    glsl.layers([
      layer()
        .hsv(() => {
          let c = [];
          c[0] = v(main.cc(2));
          c[1] = v(main.cc(3));
          c[2] = v(main.cc(4));
          return c;
        }),
      glob().shapes([
        glob_circle(ch10),
        glob_circle(ch11),
        glob_circle(ch12),
        glob_circle(ch13),
        glob_circle(ch14),
        glob_circle(ch15),
        glob_circle(ch16),
      ])
        .k(main.cc(5).range(0.2,4))
        .hsv(() => {
          let c = [];
          c[0] = v(main.cc(6));
          c[1] = v(main.cc(7));
          c[2] = v(main.cc(8));
          return c;
        })
    ]);

    glsl.compile();
  };
  
  p.draw = () => {
    p.noStroke();

    // apply the shader to a rectangle taking up the full canvas
    p.plane(p.width, p.height);

    
    // p.fill('black');
    // p.textFont(font);
    // p.textSize(5);
    // if (code)
    //   p.text(glsl._frag(), -p.width/2, -p.height/2);
  };

  p.keyPressed = () => {
    code = !code;
    const p = document.getElementById("code");
    if (code) {
      p.innerHTML = glsl._frag();
      p.style.visibility = "visible";
    } else {
      p.innerHTML = "";
      p.style.visibility = "hidden";
    }
  }
});
