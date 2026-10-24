import { createCosetAction } from './coset-core.js';

const NS = 'http://www.w3.org/2000/svg';
const root = document.querySelector('[data-coset-stage]');
const ui = key => root.querySelector(`[data-${key}]`);
const setText = (key, text) => { ui(key).textContent = text; };
const positions = [[165, 43], [58, 225], [272, 225]];
const svgNode = (tag, attributes = {}, content) => {
  const node = document.createElementNS(NS, tag);
  Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
  if (content !== undefined) node.textContent = content;
  return node;
};
let model;
let selected = 1;
let base = 0;
let trace = [0];
let steps = 0;

function options(select, values, label) {
  select.replaceChildren(...values.map(value => new Option(label(value), String(value))));
}

function loadModel() {
  model = createCosetAction(ui('model').value);
  selected = model.name === 'c6' ? 1 : 2;
  base = 0;
  options(ui('element'), model.elements, g => model.label(g));
  options(ui('base'), [0, 1, 2], point => `${model.pointLabel(point)}：${model.cosetLabel(point)}`);
  ui('element').value = String(selected);
  ui('base').value = '0';
  reset();
}

function reset() {
  trace = [base];
  steps = 0;
  render();
}

function draw(current) {
  const svg = root.querySelector('svg');
  svg.replaceChildren(svgNode('title', { id: 'coset-svg-title' },
    `${model.name === 'c6' ? 'C6 陪集' : 'S3 三角形'}的三点作用，操作 ${model.label(selected)}，当前位置 ${model.pointLabel(current)}`));
  const defs = svgNode('defs');
  const marker = svgNode('marker', { id: 'coset-arrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' });
  marker.append(svgNode('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: '#23654d' }));
  defs.append(marker);
  svg.append(defs, svgNode('path', { class: 'triangle', d: 'M165,43 L58,225 L272,225 Z' }));
  positions.forEach(([x, y], point) => {
    const image = model.act(selected, point);
    const [tx, ty] = positions[image];
    if (image === point) {
      svg.append(svgNode('path', { class: 'arrow', d: `M ${x - 20} ${y - 9} C ${x - 57} ${y - 55}, ${x + 57} ${y - 55}, ${x + 20} ${y - 9}`, 'marker-end': 'url(#coset-arrow)' }));
    } else {
      const dx = tx - x, dy = ty - y, distance = Math.hypot(dx, dy);
      const sx = x + dx / distance * 27, sy = y + dy / distance * 27;
      const ex = tx - dx / distance * 29, ey = ty - dy / distance * 29;
      svg.append(svgNode('path', { class: 'arrow', d: `M ${sx} ${sy} Q ${(x + tx) / 2 - dy / distance * 22} ${(y + ty) / 2 + dx / distance * 22} ${ex} ${ey}`, 'marker-end': 'url(#coset-arrow)' }));
    }
  });
  positions.forEach(([x, y], point) => {
    const group = svgNode('g', { class: point === current ? 'current' : '', 'data-point': point });
    group.append(svgNode('circle', { class: 'dot', cx: x, cy: y, r: 23 }),
      svgNode('text', { class: 'point-label', x, y }, model.pointLabel(point)));
    svg.append(group);
  });
}

function render() {
  const { label, pointLabel } = model;
  const current = trace.at(-1);
  const set = elements => `{${elements.map(label).join(', ')}}`;
  setText('status', `已施加 ${steps} 次 ${label(selected)}；当前位置 ${pointLabel(current)}。`);
  setText('trace', `行走记录：${steps >= 19 ? '… → ' : ''}${trace.map(pointLabel).join(' → ')}`);
  setText('map', `这个操作的完整映射：${[0, 1, 2].map(point => `${pointLabel(point)} → ${pointLabel(model.act(selected, point))}`).join('；')}。`);
  setText('cycle', `只重复这个 g，从所选起点首次返回：${model.cycle(selected, base).map(pointLabel).join(' → ')}。`);
  ui('cosets').replaceChildren(...model.cosets.map((coset, point) => {
    const li = document.createElement('li');
    li.textContent = `${model.cosetLabel(point)} = ${set(coset)}`;
    return li;
  }));
  setText('orbit', `{${model.orbit(base).map(pointLabel).join(', ')}}；允许换用群里的任意元素。`);
  setText('stabilizer', `${set(model.stabilizer(base))}；它们固定起点 ${pointLabel(base)}。`);
  setText('kernel', `${set(model.kernel)}；它们同时固定全部三个位置。`);
  setText('faithful', model.kernel.length === 1
    ? '忠实作用：只有单位元固定所有位置，六个群元素给出六种不同的整体置换。'
    : '非忠实作用：0 和 3 都固定所有位置；三个位置只能区分三种整体置换。');
  draw(current);
}

ui('model').addEventListener('change', loadModel);
ui('element').addEventListener('change', () => { selected = Number(ui('element').value); reset(); });
ui('base').addEventListener('change', () => { base = Number(ui('base').value); reset(); });
ui('apply').addEventListener('click', () => {
  trace.push(model.act(selected, trace.at(-1)));
  steps += 1;
  // The readout stays short while repeated actions remain available.
  if (trace.length > 19) trace = trace.slice(-19);
  render();
});
ui('reset').addEventListener('click', reset);
loadModel();
ui('loading').hidden = true;
ui('interactive').hidden = false;
