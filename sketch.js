// by iris enrique
// Shader Twist
// Midi Controlled Shaders
// Elektron Digitakt | Proj "Shaders" Bnk A 

import {v, e} from '/src/evaluator.js'
import {phaser} from '/src/phaser.js'
import {midi} from '/src/midi.js'
import {GLSL, layer, glob, circle, square, polygon} from '/src/twist.js';


new p5((p) => {

  let code = false;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);

    midi().trk(1).scene(sketch1).run();
    midi().trk(2).scene(sketch2);

    // midi().trk(3).scene(_ => {
      
    //   const glsl = new GLSL(p);
    //   const main = midi().ch(9);
      
    //   let tempo = main.cc(71).easemid().range(-1,1).scale(0.2);

    //   let hue = phaser().vel(tempo);
    //   glsl.layers([
    //     layer().hsv(() => {
    //       let c = [];
    //       c[0] = v(main.cc(72));
    //       c[1] = 0.5;
    //       c[2] = 0.75;
    //       return c;
    //     }),
    //     glob().shapes([
    //       circle().r(0.25),
    //       circle().r(0.25).x(phaser().vel(tempo)),
    //     ]).k(3.5)
    //   ]);

    //   glsl.compile();
    // });

    // midi().trk(4).scene(_ => {
      
    //   const glsl = new GLSL(p);
    //   const main = midi().ch(9);
      
    //   let tempo = main.cc(71).range(-1,1).easemid().scale(0.2);

    //   glsl.layers([
    //     layer().hsv([0.25, 0.35, 0.95]),
    //     glob().shapes([
    //       circle().r(0.25).y(0.3),
    //       circle().r(0.25).x(0.25),
    //       circle().r(0.25).x(0.75),
    //     ]).k(3.5)
    //   ]);

    //   glsl.compile();
    // });

  };
  
  p.draw = () => {
    p.noStroke();

    // apply the shader to a rectangle taking up the full canvas
    p.plane(p.width, p.height);
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


function sketch1() {
    const glsl = new GLSL(p);

    const main = midi().ch(9);
    
    let tempo = main.cc(71).range(-1,1).easemid().scale(0.2);

    const ch10 = midi().ch(10);
    const ch11 = midi().ch(11);
    const ch12 = midi().ch(12);
    const ch13 = midi().ch(13);
    const ch14 = midi().ch(14);
    const ch15 = midi().ch(15);
    const ch16 = midi().ch(16);

    const glob_circle = (ch) => {
      return circle()
        .x(phaser().vel(tempo.scale(ch.cc(77).scale(4))).min(-0.5).max(0.5).offset(ch.cc(73).range(-Math.PI, Math.PI)))
        .y(phaser().vel(tempo.scale(ch.cc(78).scale(4))).min(-0.5).max(0.5).offset(ch.cc(74).range(-Math.PI, Math.PI)))
        .r(phaser().vel(tempo.scale(ch.cc(75).scale(4))).min(ch.cc(71).easemid()).max(ch.cc(72).easemid()))
        .toggle(ch.mute())
    }

    glsl.layers([
      layer()
        .hsv(() => {
          let c = [];
          c[0] = v(main.cc(72));
          c[1] = v(main.cc(73));
          c[2] = v(main.cc(74));
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
        .k(main.cc(75).range(0.2,4))
        .hsv(() => {
          let c = [];
          c[0] = v(main.cc(76));
          c[1] = v(main.cc(77));
          c[2] = v(main.cc(78));
          return c;
        })
    ]);

    glsl.compile();
}

function sketch2() {
    const glsl = new GLSL(p);

    const main = midi().ch(9);
    
    let tempo = main.cc(71).range(-1,1).easemid().scale(0.2);

    const ch10 = midi().ch(10);
    const ch11 = midi().ch(11);
    const ch12 = midi().ch(12);
    const ch13 = midi().ch(13);
    const ch14 = midi().ch(14);

    const glob_circle = (ch) => {
      return circle()
        .x(phaser().vel(tempo.scale(ch.cc(77).scale(4))).min(-0.5).max(0.5).offset(ch.cc(73).range(-Math.PI, Math.PI)))
        .y(phaser().vel(tempo.scale(ch.cc(78).scale(4))).min(-0.5).max(0.5).offset(ch.cc(74).range(-Math.PI, Math.PI)))
        .r(phaser().vel(tempo.scale(ch.cc(75).scale(4))).min(ch.cc(71).easemid()).max(ch.cc(72).easemid()))
        .toggle(ch.mute())
    }

    glsl.layers([
      layer()
        .hsv(() => {
          let c = [];
          c[0] = v(main.cc(72));
          c[1] = v(main.cc(73));
          c[2] = v(main.cc(74));
          return c;
        }),
      glob().shapes([
        glob_circle(ch11),
        glob_circle(ch12),
        glob_circle(ch13),
        glob_circle(ch14),
        polygon().sides(ch10.cc(71).range(2,15)).toggle(ch10.mute()),
      ])
        .k(main.cc(75).range(0.2,4))
        .hsv(() => {
          let c = [];
          c[0] = v(main.cc(76));
          c[1] = v(main.cc(77));
          c[2] = v(main.cc(78));
          return c;
        })
    ]);

    glsl.compile();
}
});
