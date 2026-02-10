import { Evaluator, e, v } from "./evaluator.js";

let MIDIChs = Array.from({
  length: 16
}, _ => {
  let ccs = Array(128).fill(0.5);
  ccs[94] = false;
  return ccs;
});


export function midi() {

  let o = {
    ch: (n_ch) => {
      return {
        cc: (n_cc) => {
          return e(() => Math.round(MIDIChs[n_ch - 1][n_cc] * 100)/100);
        },
        mute: () => {
          return e(() => !MIDIChs[n_ch - 1][94]);
        }
      }
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

      digitakt.addListener("controlchange", e => {
        let ch = e.message.channel - 1;
        let cc = e.controller.number;
        let v = e.value;
        MIDIChs[ch][cc] = v;
        localStorage.setItem("midi", JSON.stringify(MIDIChs));
      });
  });
  
  const stored = localStorage.getItem("midi");
  if (stored) {
    MIDIChs = JSON.parse(stored);
  }
}

setupMidi();