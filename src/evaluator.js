
export class Evaluator {
  constructor(fn) {
    if (typeof fn !== 'function') {
        this._fn = () => fn;
    } else {
        this._fn = fn;
    }
    this._range = [0,1];
  }

  value() {
    return this._fn();
  }

  range(min, max) {
    const evaluator = e(() => {
      let val = ((v(this)-this._range[0]) / (this._range[1] - this._range[0])) * (v(max) - v(min)) + v(min);
      return val;
    });
    evaluator._range = [min, max];
    return evaluator;
  }

  scale(factor) {
    return e(() => v(this) * v(factor));
  }

  map(f) {
    return e(() => f(v(this)));
  }

  easemid() {
    this._range = [-1, 1];
    return this.map((x) => {
        x = (x - this._range[0]) / (this._range[1] - this._range[0]) * 2 - 1;
        let y = Math.pow(Math.cos(Math.PI * x / 2), 2);
        if (x < 0) {
            y = y - 1;
        } else {
            y = 1 - y;
        }
        return y;
    });
  }
}

export function e(f) {
  if (f instanceof Evaluator) {
    return f;
  }
  return new Evaluator(f);
}

export function v(e) {
  if (e instanceof Evaluator) {
    return e.value();
  }

  return e;
}
