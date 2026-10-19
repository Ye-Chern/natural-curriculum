import test from 'node:test';
import assert from 'node:assert/strict';
import { mod, gcd, orbit, order } from '../assets/cyclic.js';

test('negative, stationary, one-element and reversed clocks', () => {
  assert.deepEqual(orbit(12, 8), [0, 8, 4]);
  assert.deepEqual(orbit(10, -4), [0, 6, 2, 8, 4]);
  assert.deepEqual(orbit(12, 0), [0]);
  assert.deepEqual(orbit(1, -360), [0]);
  assert.equal(order(1, 0), 1);
  assert.equal(mod(-12, 12), 0);
  assert.equal(gcd(12, -8), 4);
});

test('25,956 supported parameter pairs agree with independent integer divisibility', () => {
  let checked = 0;
  for (let n = 1; n <= 36; n++) {
    for (let k = -360; k <= 360; k++) {
      // This oracle searches positive return times; it does not call gcd or orbit.
      let firstReturn = 1;
      while ((firstReturn * k) % n !== 0) firstReturn++;
      const path = orbit(n, k);
      assert.equal(order(n, k), firstReturn, `${n},${k}`);
      assert.equal(path.length, firstReturn);
      assert.equal(new Set(path).size, path.length);
      path.forEach((position, i) => {
        assert.ok(position >= 0 && position < n);
        assert.ok((position - i * k) % n === 0);
      });
      checked++;
    }
  }
  assert.equal(checked, 25956);
});

test('all subgroups for n≤12 found by independent subset enumeration equal the divisor list', () => {
  for (let n = 1; n <= 12; n++) {
    const found = [];
    for (let mask = 1; mask < (1 << n); mask += 2) {
      const subset = Array.from({ length: n }, (_, i) => i).filter(i => mask & (1 << i));
      if (subset.every(a => subset.every(b => mask & (1 << ((a - b + n) % n))))) {
        found.push(subset.join(','));
      }
    }
    const expected = [];
    for (let d = 1; d <= n; d++) {
      if (n % d === 0) expected.push(Array.from({ length: n / d }, (_, j) => j * d).join(','));
    }
    assert.deepEqual(found.sort(), expected.sort(), `n=${n}`);
  }
});

test('domain errors are explicit', () => {
  for (const [n, k] of [[0, 1], [-2, 1], [2.5, 1], [5, NaN], [5, 1.5]]) {
    assert.throws(() => orbit(n, k), RangeError);
    assert.throws(() => order(n, k), RangeError);
  }
});
