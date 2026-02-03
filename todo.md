# To Do

1. Modulate other circles
2. Mute / Unmute (for all the extra circles)
3. Inject uniform definitions into GLSL

Refactoring:
1. It's time to start breaking apart the main .js file into components.
- Eg. phaser.js, midi.js, uniform.js, etc.

### 2026 Feb 2
1. 

### 2026 Jan 31
1. Used the tooling built yesterday to expand on play:
  - Can change background color
  - Can change smoothing coefficient for a more or less blobby effect.

### 2026 Jan 30
1. Phaser/Oscillator Params
  a. Velocity
  b. Min / Max Values
  c. Start Value
2. Came up with a pretty code structure that allows easy pairing between GLSL uniforms and Midi CCs
  - Allows setting range of CC values and mapping for non-linear functions
  - Created an "Evaluator" class. I don't like how wordy it is. I think I can refactor to be able to simply pass anonym functions 
    as params and then turn into Evaluators under the hood.
3. Paired with C
  - Helped a lot with working through some fine of the finer details of JS.
  - They suggested I use classes, but I don't like how it looks so I went ahead and used JS closures instead for a lot of what I'm doing. 

### 2026 Jan 29

1. Phasers
    - Paired with David Allen Feil, who helped me approach the problem from a new angle
    - Specifically, instead of thinking about changing the frequency and how it relates to time, to forget about time, because time is simply phase. We can keep track of phase (from 0 to 2PI) 
      and at each frame increment it by a velocity vector tied to a Midi CC. 
    - We also played around with using non-linear functions to have finer control at specific points, for example
      when modifying a circle radius, we'll want finer control when it's small (at lower values of the potentiometer),
      so we can use an exponential function for it. Or, when using a phaser, we can use bell and S curves to achieve
      different effects. An (inverted) s-curve from -1 to 1 achieved a cool effect of going either backwards of forwards in the phase.

### 2026 Jan 27

1. bindUniformToCh
    - For oscillators
2. First try at oscillators
    - Works better, but not as well as I would like too. Somestimes the movement is smooth. Sometimes it's not.

### 2026 Jan 26

0. MIDI Channels
    - Reading multiple MIDI channels with WebMIDI
    device.addListener("controlchange", e => {
      if (e.message.channel == channel) {
        callback(e.controller.number, e.value);
      }
    });

a. Circle
    1. Initial Value
    2. Interpolation

### 2026 Jan 22

1. Research Limits of MIDI
    - Close to impossible to work around
    - Perhaps better to use something like OSC
        - Could use TouchOSC with some kind of library
        - Cons: Looks like it requires setting up a web server