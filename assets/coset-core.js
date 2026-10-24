// Finite models used by the lesson. Composition always applies the right factor first.
const PERMUTATIONS = [
  [0, 1, 2], [0, 2, 1], [1, 0, 2],
  [1, 2, 0], [2, 0, 1], [2, 1, 0]
];
const PERMUTATION_NAMES = ['e', '(23)', '(12)', '(123)', '(132)', '(13)'];

export function compose(left, right) {
  return right.map(image => left[image]);
}

export function createCosetAction(name) {
  if (!['c6', 's3'].includes(name)) throw new RangeError('Unknown model');
  const cyclic = name === 'c6';
  const elements = [0, 1, 2, 3, 4, 5];
  const multiply = cyclic
    ? (a, b) => (a + b) % 6
    : (a, b) => PERMUTATIONS.findIndex(p => p.every((v, i) => v === compose(PERMUTATIONS[a], PERMUTATIONS[b])[i]));
  const inverse = a => elements.find(b => multiply(a, b) === 0 && multiply(b, a) === 0);
  const subgroup = cyclic ? [0, 3] : [0, 1];
  const representatives = cyclic ? [0, 1, 2] : [0, 2, 5];
  const cosets = representatives.map(x => subgroup.map(h => multiply(x, h)).sort((a, b) => a - b));
  const label = a => cyclic ? String(a) : PERMUTATION_NAMES[a];
  const pointLabel = point => cyclic ? ['A', 'B', 'C'][point] : String(point + 1);
  const cosetLabel = point => cyclic ? ['A', 'B', 'C'][point] : ['H', '(12)H', '(13)H'][point];
  const act = (g, point) => cosets.findIndex(coset => coset.includes(multiply(g, representatives[point])));
  const stabilizer = point => elements.filter(g => act(g, point) === point);
  const kernel = elements.filter(g => cosets.every((_, point) => act(g, point) === point));
  const orbit = point => [...new Set(elements.map(g => act(g, point)))].sort();
  const cycle = (g, point) => {
    const result = [point];
    let next = act(g, point);
    while (next !== point) {
      result.push(next);
      next = act(g, next);
    }
    return [...result, point];
  };
  return { name, elements, multiply, inverse, subgroup, representatives, cosets, label,
    pointLabel, cosetLabel, act, stabilizer, kernel, orbit, cycle };
}
