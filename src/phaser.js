import { Evaluator, e, v } from "./evaluator.js";

export class Phaser extends Evaluator {
  constructor() {
    super(() => {
      let max = v(this._max);
      let min = v(this._min);
      let amp = (max - min) / 2;
      let mid = (max + min) / 2;
      return amp * Math.sin(this._phase + v(this._offset)) + mid;
    });

    this._phase = 0;
    this._vel = 0;
    this._min = -1;
    this._max = 1;
    this._offset = 0;

    requestAnimationFrame(() => this._update());
  }

  _update() {
    this._phase += v(this._vel);
    requestAnimationFrame(() => this._update());
  }

  vel(f) {
    this._vel = e(f);
    return this;
  }

  min(f) {
    this._min = e(f);
    return this;
  }

  max(f) {
    this._max = e(f);
    return this;
  }

  offset(f) {
    this._offset = e(f);
    return this;
  }

}

export function phaser() {
  return new Phaser();
}
