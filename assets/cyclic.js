// Pure arithmetic is shared by the browser experiment and independent tests.
export function mod(a, n) {
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(n) || n < 1) {
    throw new RangeError('Use safe integers and a positive modulus.');
  }
  const remainder = a % n;
  return remainder === 0 ? 0 : remainder < 0 ? remainder + n : remainder;
}

export function gcd(a, b) {
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b)) throw new RangeError('Use safe integers.');
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function orbit(n, k) {
  const step = mod(k, n);
  const result = [0];
  let current = step;
  while (current !== 0) {
    result.push(current);
    current = current >= n - step ? current - (n - step) : current + step;
  }
  return result;
}

export function order(n, k) {
  mod(k, n); // Validate the domain even when k is zero.
  return n / gcd(n, k);
}

function svgElement(tag, attrs, content) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
  if (content !== undefined) element.textContent = content;
  return element;
}

export function mountClock(root) {
  const nInput = root.querySelector('[name="clock-n"]');
  const kInput = root.querySelector('[name="clock-k"]');
  const svg = root.querySelector('svg');
  const status = root.querySelector('[data-status]');
  const trace = root.querySelector('[data-trace]');
  const result = root.querySelector('[data-result]');
  const error = root.querySelector('[data-error]');
  const buttons = [...root.querySelectorAll('button')];
  let n = 12, k = 4, steps = 0, valid = true;

  function draw() {
    const path = orbit(n, k);
    const length = path.length;
    const shown = Math.min(steps, length);
    const visited = new Set(Array.from({ length: shown + 1 }, (_, i) => path[i % length]));
    const current = path[steps % length];
    svg.replaceChildren(svgElement('title', { id: 'clock-svg-title' }, `${n} 格钟面，每次转 ${k} 格，当前位置 ${current}`));
    const position = (i, radius = 128) => [180 + radius * Math.sin(2 * Math.PI * i / n), 180 - radius * Math.cos(2 * Math.PI * i / n)];
    svg.append(svgElement('circle', { cx: 180, cy: 180, r: 128, class: 'clock-rim' }));
    for (let i = 0; i < shown; i++) {
      const a = path[i % length], b = path[(i + 1) % length];
      const [x1, y1] = position(a), [x2, y2] = position(b);
      svg.append(svgElement('line', { x1, y1, x2, y2, class: 'clock-edge' }));
    }
    for (let i = 0; i < n; i++) {
      const [cx, cy] = position(i);
      const [x, y] = position(i, 153);
      const state = i === current ? ' current' : visited.has(i) ? ' visited' : '';
      svg.append(svgElement('circle', { cx, cy, r: i === current ? 8 : 5, class: `clock-point${state}`, 'data-node': i }));
      svg.append(svgElement('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'clock-label' }, i));
    }
    const [x2, y2] = position(current, 108);
    svg.append(svgElement('line', { x1: 180, y1: 180, x2, y2, class: 'clock-hand' }));
    svg.append(svgElement('circle', { cx: 180, cy: 180, r: 5, class: 'clock-hub' }));
    status.textContent = `已走 ${steps} 步；当前位置 ${current}；已访问 ${visited.size} / ${n} 个位置。`;
    const displayedSteps = Math.min(steps, 2 * length);
    const sequence = Array.from({ length: displayedSteps + 1 }, (_, i) => path[i % length]);
    const continuation = steps > displayedSteps
      ? ` → … → ${current}（第 ${Math.floor(steps / length) + 1} 轮，第 ${steps % length} 步）`
      : steps > length ? '（轨道开始重复）' : '';
    trace.textContent = `行走记录：${sequence.join(' → ')}${continuation}`;
    result.hidden = steps < length;
    result.textContent = `第一次返回 0 需要 ${length} 步。gcd(${n}, ${k}) = ${gcd(n, k)}，${n} ÷ ${gcd(n, k)} = ${length}。${length === n ? '这个步长能生成整个循环群。' : '这个步长只生成一个真子群。'}`;
  }

  function change() {
    const nextN = nInput.valueAsNumber, nextK = kInput.valueAsNumber;
    valid = Number.isInteger(nextN) && nextN >= 1 && nextN <= 36 && Number.isInteger(nextK) && Math.abs(nextK) <= 360;
    error.textContent = valid ? '' : '请输入 1–36 的整数格数，以及 −360–360 的整数步长。';
    for (const input of [nInput, kInput]) input.setAttribute('aria-invalid', String(!valid));
    for (const button of buttons) button.disabled = !valid;
    if (!valid) return;
    n = nextN;
    k = nextK;
    steps = 0;
    draw();
  }

  nInput.addEventListener('input', change);
  kInput.addEventListener('input', change);
  root.querySelector('[data-step]').addEventListener('click', () => { if (valid) { steps++; draw(); } });
  root.querySelector('[data-orbit]').addEventListener('click', () => { if (valid) { steps = order(n, k); draw(); } });
  root.querySelector('[data-reset]').addEventListener('click', () => { steps = 0; draw(); });
  root.querySelector('[data-controls]').hidden = false;
  root.querySelector('[data-canvas]').hidden = false;
  root.querySelector('[data-loading]').hidden = true;
  draw();
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-cyclic-clock]').forEach(mountClock);
}
