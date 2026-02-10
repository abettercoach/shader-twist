import { Evaluator, e, v } from "./evaluator";

export class Clock extends Evaluator {
  constructor(vel) {
    super(() => this._phase);

    this._phase = 0.0;
    if (!vel) {
      vel = () => 1;
    }
    this._vel = e(vel);
    
    requestAnimationFrame(() => this._update());
  }

  _update() {
    this._phase += v(this._vel);
    requestAnimationFrame(() => this._update());
  }
}

export function clock(vel) {
  return new Clock(vel);
}
