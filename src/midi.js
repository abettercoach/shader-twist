import { Evaluator, e, v } from "./evaluator.js";



 let scenes = {};
 let curr_scene = 0;

let MIDIChs = blankMIDIstate();

function blankMIDIstate() {
  return Array.from({
    length: 16
  }, _ => {
    let ccs = Array(128).fill(0.5);
    ccs[94] = false;
    return ccs;
  });
}


export function midi() {

  let o = {
    ch: (n_ch) => {
      return {
        cc: (n_cc) => {
          return e(() => Math.round(MIDIChs[n_ch - 1][n_cc] * 100)/100);
        },
        mute: () => {
          return e(() => {
            return !MIDIChs[n_ch - 1][94]
          });
        }
      }
    },
    trk: (n_trk) => {
      return {
        scene: (fn) => {
          if (!scenes[n_trk - 1]) {
            scenes[n_trk - 1] = {};
          }
          scenes[n_trk - 1].run = fn;
          return {
            run: _ => {
              MIDIChs = scenes[n_trk - 1].midi_state ?? blankMIDIstate();
              scenes[n_trk - 1].run();
            }
          };
        }
      };
    }
  };

  return o;
}

function setupMidi() {
  WebMidi.enable().then(() => {
      let digitakt = WebMidi.getInputByName("Elektron Digitakt");
      if (!digitakt) {
        console.log("Digitakt not found");
        return;
      }

      console.log("digitakt adding listener");

      digitakt.addListener("programchange", e => {
        console.log("programchange")
        const trk = e.value - 1;
        curr_scene = trk;
        const scene = scenes[curr_scene];
        if (scene && scene.run) {
          localStorage.setItem("curr_scene", curr_scene);
          MIDIChs = scene.midi_state ?? blankMIDIstate();
          scene.run();
        }
      });

      digitakt.addListener("controlchange", e => {

        let ch = e.message.channel - 1;
        let cc = e.controller.number;
        let v = e.value;
        MIDIChs[ch][cc] = v;

        scenes[curr_scene].midi_state = MIDIChs;
        localStorage.setItem("scenes", JSON.stringify(scenes));
      });
  });
  
  const stored_scenes = localStorage.getItem("scenes");
  if (stored_scenes) {
    scenes = JSON.parse(stored_scenes);
  }

  const stored_curr_scene = localStorage.getItem("curr_scene");
  if (stored_curr_scene) {
    curr_scene = stored_curr_scene;
  }

}

setupMidi();