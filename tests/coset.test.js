import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compose, createCosetAction } from '../assets/coset-core.js';

// Independent reference: act on six integers or on three vertices directly,
// without using the implementation's coset construction or multiplication table.
const vertexMaps = {
  e: [0, 1, 2], '(23)': [0, 2, 1], '(12)': [1, 0, 2],
  '(123)': [1, 2, 0], '(132)': [2, 0, 1], '(13)': [2, 1, 0]
};
const direct = (model, g, point) => model.name === 'c6'
  ? (point + Number(model.label(g))) % 3
  : vertexMaps[model.label(g)][point];
const sorted = values => [...values].sort((a, b) => a - b);

test('permutation products apply the rightmost permutation first', () => {
  assert.deepEqual(compose(vertexMaps['(12)'], vertexMaps['(23)']), vertexMaps['(123)']);
  assert.notDeepEqual(compose(vertexMaps['(23)'], vertexMaps['(12)']), vertexMaps['(123)']);
});

for (const name of ['c6', 's3']) {
  const model = createCosetAction(name);
  test(`${name}: all six group elements act as independently computed vertex maps`, () => {
    for (const g of model.elements) {
      const images = [0, 1, 2].map(point => model.act(g, point));
      assert.deepEqual(images, [0, 1, 2].map(point => direct(model, g, point)));
      assert.deepEqual(sorted(images), [0, 1, 2]);
    }
  });
  test(`${name}: cosets partition the group; all representatives give the same images`, () => {
    assert.deepEqual(sorted(model.cosets.flat()), model.elements);
    for (const g of model.elements) {
      for (let point = 0; point < 3; point += 1) {
        const target = model.cosets[model.act(g, point)];
        assert.deepEqual(sorted(model.cosets[point].map(x => model.multiply(g, x))), target);
      }
    }
    for (const g of model.elements) {
      for (const h of model.elements) {
        for (let point = 0; point < 3; point += 1) {
          assert.equal(model.act(model.multiply(g, h), point), direct(model, g, direct(model, h, point)));
        }
      }
    }
  });
  test(`${name}: stabilizers, full orbits, kernel and core agree with direct checks`, () => {
    for (let point = 0; point < 3; point += 1) {
      const stabilizer = model.elements.filter(g => direct(model, g, point) === point);
      const orbit = sorted(new Set(model.elements.map(g => direct(model, g, point))));
      assert.deepEqual(model.stabilizer(point), stabilizer);
      assert.deepEqual(model.orbit(point), orbit);
      assert.equal(stabilizer.length * orbit.length, model.elements.length);
    }
    const directKernel = model.elements.filter(g => [0, 1, 2].every(point => direct(model, g, point) === point));
    const core = model.elements.filter(g => model.elements.every(x =>
      model.subgroup.includes(model.multiply(model.multiply(model.inverse(x), g), x))));
    assert.deepEqual(model.kernel, directKernel);
    assert.deepEqual(model.kernel, core);
    assert.equal(new Set(model.elements.map(g => [0, 1, 2].map(point => direct(model, g, point)).join(','))).size,
      model.elements.length / directKernel.length);
  });
  test(`${name}: a single repeated element has a correctly closed orbit`, () => {
    for (const g of model.elements) {
      for (let point = 0; point < 3; point += 1) {
        const expected = [point];
        let next = direct(model, g, point);
        while (next !== point) {
          assert.ok(expected.length <= 3);
          expected.push(next);
          next = direct(model, g, next);
        }
        expected.push(point);
        assert.deepEqual(model.cycle(g, point), expected);
      }
    }
  });
}

test('teaching contrast: stabilizer is not generally the whole-action kernel', () => {
  const c6 = createCosetAction('c6');
  assert.deepEqual(c6.kernel.map(c6.label), ['0', '3']);
  const s3 = createCosetAction('s3');
  assert.deepEqual(s3.stabilizer(0).map(s3.label), ['e', '(23)']);
  assert.deepEqual(s3.stabilizer(1).map(s3.label), ['e', '(13)']);
  assert.deepEqual(s3.stabilizer(2).map(s3.label), ['e', '(12)']);
  assert.deepEqual(s3.kernel.map(s3.label), ['e']);
  assert.deepEqual(s3.cycle(s3.elements.find(g => s3.label(g) === '(12)'), 0), [0, 1, 0]);
  assert.deepEqual(s3.orbit(0), [0, 1, 2]);
});

test('unsupported models fail explicitly', () => {
  assert.throws(() => createCosetAction('general-group'), RangeError);
});
