import { createFluid } from './fluid.js';
import { InkLandscape } from './landscape.js';

const scene = document.querySelector('#scene');
const canvas = document.querySelector('#fish');
const ctx = canvas.getContext('2d');
const generateButton = document.querySelector('#generate');
const pauseButton = document.querySelector('#pause');
const status = document.querySelector('#status');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reducedMotion.matches;
let fish = [];
let water;
let clock = 0;
let lastTime = 0;
let lastWake = 0;
let animation;
let generating = false;
const landscapeDrawing = new InkLandscape(document.querySelector('#landscape'), document.querySelector('#reflection'));
let activeWorkers = new Set();
let waterFailed = false;
let visible = true;

// Separate workers isolate the landscape's Math.random override and keep drawing responsive.
function drawInWorker(name, seed) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL(`./vendor/${name}-worker.js`, document.baseURI));
    activeWorkers.add(worker);
    const finish = () => { clearTimeout(timeout); worker.terminate(); activeWorkers.delete(worker); };
    const timeout = setTimeout(() => { finish(); reject(new Error('Drawing took too long. Please try another landscape.')); }, 45000);
    worker.onmessage = ({ data }) => { finish(); data.error ? reject(new Error(data.error)) : resolve(data); };
    worker.onerror = () => { finish(); reject(new Error('The drawing could not load. Please try again.')); };
    worker.postMessage({ seed });
  });
}
function resize() {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  paintFish();
  landscapeDrawing.paint(0, false);
}
function paintFish() {
  const width = canvas.clientWidth, height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);
  // Quiet horizontal strokes persist as the fallback on devices without WebGL.
  ctx.strokeStyle = '#62625c'; ctx.lineWidth = .6;
  for (let i = 0; i < 26; i++) {
    const x = ((i * .173 + clock * .001) % 1) * width;
    const y = height * (.1 + (i * .137 % .75));
    ctx.globalAlpha = .07;
    ctx.beginPath(); ctx.ellipse(x, y, 18 + i % 5 * 13, 1.6, 0, 0, Math.PI); ctx.stroke();
  }
  fish.forEach((f, index) => {
    const phase = clock * f.speed;
    f.x = ((f.start + phase * f.direction) % 1.3 + 1.3) % 1.3 - .15;
    f.y = f.depth + Math.sin(clock * .35 + index * 2) * .035;
    const size = Math.min(width * f.size, 240);
    ctx.save();
    ctx.translate(f.x * width, f.y * height);
    ctx.rotate(Math.sin(clock * .7 + index) * .035);
    ctx.scale(-f.direction * size / 500, size / 500);
    ctx.translate(-250, -150);
    ctx.globalAlpha = f.opacity;
    ctx.lineWidth = 1.1; ctx.strokeStyle = '#343632'; ctx.lineJoin = 'round';
    ctx.stroke(f.path);
    ctx.restore();
  });
  ctx.globalAlpha = 1;
}
function frame(time) {
  animation = undefined;
  if (paused || document.hidden || !visible) return;
  const dt = Math.min((time - (lastTime || time)) / 1000, .04);
  lastTime = time; clock += dt;
  landscapeDrawing.paint(dt);
  paintFish();
  if (water && !waterFailed) {
    if (clock - lastWake > .2) {
      fish.forEach(f => {
        if (f.x > 0 && f.x < 1) water.splat(f.x, 1 - f.y, f.direction * 22, Math.sin(clock) * 5, .018);
      });
      lastWake = clock;
    }
    water.tick();
  }
  animation = requestAnimationFrame(frame);
}
function syncMotion() {
  if (animation) cancelAnimationFrame(animation);
  lastTime = 0;
  pauseButton.textContent = paused ? 'Resume motion' : 'Pause motion';
  pauseButton.setAttribute('aria-pressed', String(paused));
  document.querySelector('#gesture').textContent = waterFailed ? 'A quiet river · still-water mode' : paused ? 'The river is resting · resume motion below' : 'Drag through the river to stir the ink';
  if (!paused && !document.hidden && visible) animation = requestAnimationFrame(frame);
}
function initWater() {
  try {
    water = createFluid(document.querySelector('#fluid'));
    water.tick();
  } catch (error) {
    waterFailed = true;
    document.querySelector('#fluid').hidden = true;
    document.querySelector('#gesture').textContent = 'A quiet river · still-water mode';
    status.textContent = 'Live fluid is unavailable on this device. The drawing and fish still work.';
  }
}
async function generate() {
  if (generating) return;
  generating = true;
  generateButton.disabled = true;
  scene.setAttribute('aria-busy', 'true');
  const loading = document.querySelector('#loading');
  loading.hidden = false;
  status.textContent = '';
  loading.textContent = 'Grinding the ink. Drawing a world…';
  const seed = crypto.getRandomValues(new Uint32Array(1))[0] % 10000000;
  try {
    const landscape = await drawInWorker('landscape', seed);
    const specimens = [];
    // Limit concurrent heavy geometry generation, especially on phones.
    for (let i = 0; i < 5; i++) {
      loading.textContent = `Drawing the river’s inhabitants… ${i + 1} / 5`;
      const { lines } = await drawInWorker('fish', seed + i);
      const path = new Path2D();
      for (const line of lines) {
        line.forEach(([x, y], j) => j ? path.lineTo(x, y) : path.moveTo(x, y));
      }
      specimens.push({ path, start: .12 + i * .22, depth: .25 + (i * .21 % .48), size: .14 + (i % 3) * .025, direction: i % 2 ? -1 : 1, speed: .011 + i * .002, opacity: .4 + (i % 3) * .15 });
    }
    landscapeDrawing.load(landscape.svg, paused);
    fish = specimens; clock = 0; lastWake = 0;
    document.querySelector('#redraw').disabled = false;
    document.querySelector('#seed-label').textContent = `Composition No. ${String(seed).padStart(7, '0')}`;
    paintFish();
    if (!water && !waterFailed) initWater();
    if (!waterFailed) status.textContent = paused ? 'Motion is paused. Resume whenever you like.' : 'Watch the ink appear, stroke by stroke. The landscape drifts with the river.';
  } catch (error) {
    status.textContent = 'Could not finish this composition. Try “New landscape” again.';
    console.error('Ink & Current generation:', error);
  } finally {
    loading.hidden = true; generating = false; generateButton.disabled = false;
    scene.setAttribute('aria-busy', 'false'); syncMotion();
  }
}
let pointer;
canvas.addEventListener('pointerdown', event => {
  if (paused || !water || waterFailed) return;
  const rect = canvas.getBoundingClientRect();
  pointer = { x: (event.clientX - rect.left) / rect.width, y: 1 - (event.clientY - rect.top) / rect.height };
  canvas.setPointerCapture(event.pointerId);
  water.splat(pointer.x, pointer.y, 0, 25, .2);
});
canvas.addEventListener('pointermove', event => {
  if (!pointer || paused || waterFailed) return;
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width, y = 1 - (event.clientY - rect.top) / rect.height;
  water.splat(x, y, (x - pointer.x) * 3500, (y - pointer.y) * 3500, .16);
  pointer = { x, y };
});
for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(name, () => { pointer = null; });
document.querySelector('#fluid').addEventListener('webglcontextlost', event => {
  event.preventDefault(); waterFailed = true; water = undefined;
  document.querySelector('#fluid').hidden = true;
  status.textContent = 'The river switched to still-water mode. Reload to restore live fluid.';
});
generateButton.addEventListener('click', generate);
document.querySelector('#redraw').addEventListener('click', () => {
  landscapeDrawing.replay(reducedMotion.matches);
  if (!reducedMotion.matches) paused = false;
  syncMotion();
});
pauseButton.addEventListener('click', () => { paused = !paused; pointer = null; syncMotion(); });
reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; syncMotion(); });
document.addEventListener('visibilitychange', syncMotion);
new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncMotion(); }).observe(scene);
new ResizeObserver(resize).observe(canvas);
window.addEventListener('pagehide', () => { activeWorkers.forEach(worker => worker.terminate()); });
resize(); syncMotion(); generate();
