import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// A folded surface with a narrow base, broad shoulder, and a curled tip.
function petalGeometry() {
  const vertices = [], indices = [], uv = [];
  const rows = 28, columns = 14;
  for (let i = 0; i <= rows; i++) {
    const t = i / rows;
    const width = Math.pow(Math.sin(Math.PI * t), .7) * .48;
    for (let j = 0; j <= columns; j++) {
      const across = j / columns * 2 - 1;
      vertices.push(across * width, t * 1.8, .48 * t * t + .23 * across * across * Math.sin(Math.PI * t) - .13 * Math.sin(t * Math.PI));
      uv.push(j / columns, t);
      if (i < rows && j < columns) {
        const n = i * (columns + 1) + j;
        indices.push(n, n + 1, n + columns + 1, n + 1, n + columns + 2, n + columns + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}

export function createHero(root) {
  const stage = root.querySelector('.spatial-stage');
  const host = root.querySelector('.spatial-canvas');
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 60);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  scene.environmentIntensity = .75;
  room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb2a4c0, 1.25));
  const key = new THREE.DirectionalLight(0xfff3e9, 2.2);
  key.position.set(-3, 6, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xc1c4ff, 1.5);
  rim.position.set(4, 2, -3); scene.add(rim);

  const sculpture = new THREE.Group();
  sculpture.position.set(1.1, .35, 0); scene.add(sculpture);
  const shell = new THREE.Group(); sculpture.add(shell);
  const petal = petalGeometry();
  const materials = ['#b69cc7', '#d7b1bf', '#9aaaca', '#c8bbd8'].map(color => new THREE.MeshPhysicalMaterial({
    color, metalness: .28, roughness: .26, clearcoat: .85, clearcoatRoughness: .18,
    side: THREE.DoubleSide, iridescence: .32, iridescenceIOR: 1.35,
  }));
  const petals = [];
  // Three spiraling layers form a suspended architectural bloom.
  for (let layer = 0; layer < 3; layer++) {
    const count = 7 + layer * 2;
    for (let i = 0; i < count; i++) {
      const pivot = new THREE.Group();
      const angle = i / count * Math.PI * 2 + layer * .43;
      pivot.rotation.y = angle;
      pivot.position.y = -.48 + layer * .22;
      const mesh = new THREE.Mesh(petal, materials[(i + layer) % materials.length]);
      mesh.rotation.x = .67 + layer * .25;
      mesh.rotation.z = -.15;
      mesh.scale.setScalar(1.13 - layer * .19);
      mesh.position.z = .16 + layer * .05;
      pivot.add(mesh); shell.add(pivot);
      petals.push({ mesh, angle, base: mesh.rotation.x });
    }
  }
  shell.rotation.x = .23; shell.rotation.z = -.16;
  const chrome = new THREE.MeshPhysicalMaterial({ color: '#b3a8c9', metalness: .92, roughness: .18, clearcoat: 1 });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.53, 1), chrome);
  core.position.y = .52; sculpture.add(core);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(core.geometry), new THREE.LineBasicMaterial({ color: '#e9e3f1', transparent: true, opacity: .35 }));
  core.add(edges);

  const orbit = new THREE.Group(); orbit.rotation.set(.5, .15, -.25); sculpture.add(orbit);
  const orbitMaterial = new THREE.MeshStandardMaterial({ color: '#aaa3bd', metalness: .75, roughness: .3 });
  [2.05, 2.18].forEach((radius, i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, i ? .005 : .013, 8, 180), orbitMaterial);
    ring.rotation.x = Math.PI / 2; orbit.add(ring);
  });
  const satellite = new THREE.Mesh(new THREE.SphereGeometry(.07, 20, 14), chrome);
  orbit.add(satellite);
  const ticks = [];
  for (let i = 0; i < 72; i++) {
    const a = i / 72 * Math.PI * 2;
    const r = i % 6 ? 2.24 : 2.30;
    ticks.push(Math.cos(a) * 2.2, 0, Math.sin(a) * 2.2, Math.cos(a) * r, 0, Math.sin(a) * r);
  }
  orbit.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(ticks, 3)), new THREE.LineBasicMaterial({color:'#aca6ba',transparent:true,opacity:.55})));

  const plinthMaterial = new THREE.MeshPhysicalMaterial({ color: '#e7e5ee', metalness: .12, roughness: .3, clearcoat: .8 });
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.72, .16, 96), plinthMaterial);
  plinth.position.set(1.1, -1.65, 0); scene.add(plinth);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.5, .1, 96), chrome);
  foot.position.set(1.1, -1.77, 0); scene.add(foot);
  // Analytic soft shadow: no external bitmap or costly live shadow map.
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'varying vec2 vUv; void main(){float d=length((vUv-.5)*2.);float a=exp(-d*d*9.)*.17;gl_FragColor=vec4(.34,.29,.43,a);}',
  }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(1.1, -1.84, 0); scene.add(shadow);

  // One instanced draw call for the falling petals.
  const falling = new THREE.InstancedMesh(petal, materials[0], 65);
  falling.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  falling.frustumCulled = false; scene.add(falling);
  const seeds = Array.from({ length: 65 }, (_, i) => ({ x: Math.sin(i * 127.1) * 6, y: (i * .731) % 7, z: Math.cos(i * 49.7) * 2 - 1, speed: .13 + (i % 7) * .023, phase: i * 2.399, scale: .035 + (i % 5) * .014 }));
  const dummy = new THREE.Object3D();
  const intro = root.querySelector('[data-spatial="intro"]');
  const detail = root.querySelector('[data-spatial="detail"]');
  const motionButton = root.querySelector('#hero-motion');
  const breezeButton = root.querySelector('#hero-breeze');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches, visible = true, disposed = false, lost = false;
  let width = 1, height = 1, time = 0, last = 0, frame = 0, breeze = 0;
  let pointerX = 0, pointerY = 0, smoothX = 0, smoothY = 0;
  const projected = new THREE.Vector3();
  const clamp = THREE.MathUtils.clamp;
  function projectPanel(element, x, y, z, tilt) {
    projected.set(x, y, z).project(camera);
    element.style.left = `${(projected.x * .5 + .5) * width}px`;
    element.style.top = `${(-projected.y * .5 + .5) * height}px`;
    element.style.transform = `translate(-50%,-50%) perspective(1400px) rotateY(${tilt + smoothX * 2}deg) rotateX(${-smoothY * 1.5}deg)`;
  }
  function render(now = 0) {
    frame = 0;
    if (disposed || lost) return;
    const dt = Math.min((now - last) / 1000 || 0, .04); last = now;
    if (!paused) { time += dt; breeze *= Math.exp(-dt * .65); }
    const mobile = width < 700;
    const progress = reduced.matches || mobile ? 0 : clamp(-root.getBoundingClientRect().top / Math.max(1, root.offsetHeight - height), 0, 1);
    smoothX += ((paused ? 0 : pointerX) - smoothX) * .04;
    smoothY += ((paused ? 0 : pointerY) - smoothY) * .04;
    camera.position.set(smoothX * .22 + progress * .4, 1.45 + smoothY * .16 + progress * .3, mobile ? 12.8 : 11.8 - progress * .65);
    camera.lookAt(mobile ? 1.1 : 0, mobile ? -2.4 : -.02, 0);
    if (mobile) { sculpture.position.y = 2.4; plinth.position.y = .4; foot.position.y = .28; shadow.position.y = .21; }
    else { sculpture.position.y = .35 + Math.sin(time * .6) * .075; plinth.position.y = -1.65; foot.position.y = -1.77; shadow.position.y = -1.84; }
    shell.rotation.y = time * .065 + progress * .4;
    core.rotation.set(time * .09, time * .16, .2);
    petals.forEach(({ mesh, base, angle }) => { mesh.rotation.x = base + Math.sin(time * .65 + angle) * .035 + breeze * .045; });
    orbit.rotation.y = time * .045;
    satellite.position.set(Math.cos(time * .18) * 2.05, 0, Math.sin(time * .18) * 2.05);
    seeds.forEach((seed, i) => {
      const y = ((seed.y - time * seed.speed) % 7 + 7) % 7 - 3;
      dummy.position.set(seed.x + Math.sin(time * .23 + seed.phase) * .6 + Math.sin(time + seed.phase) * breeze * .25, y + (mobile ? 2 : 0), seed.z);
      dummy.rotation.set(time * .3 + seed.phase, time * .2 + seed.phase, Math.sin(time * .4 + seed.phase));
      dummy.scale.setScalar(seed.scale); dummy.updateMatrix(); falling.setMatrixAt(i, dummy.matrix);
    });
    falling.instanceMatrix.needsUpdate = true;
    if (!mobile) {
      // World anchors follow the same camera as the sculpture, preserving spatial depth.
      const span = Math.tan(THREE.MathUtils.degToRad(17)) * 11.8 * width / height;
      projectPanel(intro, -span * .54, .3, .6, -5);
      projectPanel(detail, span * .77, .6, -.15, 7);
    }
    stage.style.setProperty('--scroll-marker', `${progress * 16}px`);
    renderer.render(scene, camera);
    if (!paused && visible && !document.hidden) frame = requestAnimationFrame(render);
  }
  function requestRender() { if (!frame && !disposed && !lost) { last = performance.now(); frame = requestAnimationFrame(render); } }
  function resize() { width = host.clientWidth; height = host.clientHeight; camera.aspect = width / Math.max(height, 1); camera.updateProjectionMatrix(); renderer.setSize(width, height); requestRender(); }
  function pointer(event) { const rect = stage.getBoundingClientRect(); pointerX = (event.clientX - rect.left) / rect.width * 2 - 1; pointerY = (event.clientY - rect.top) / rect.height * 2 - 1; }
  function leave() { pointerX = pointerY = 0; }
  function updateButton() { motionButton.textContent = paused ? 'Resume motion' : 'Pause motion'; motionButton.setAttribute('aria-pressed', String(paused)); }
  function toggle() { paused = !paused; updateButton(); requestRender(); }
  function stir() { breeze = 3; if (paused) { paused = false; updateButton(); } requestRender(); }
  function preference() { paused = reduced.matches; updateButton(); requestRender(); }
  function visibility() { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else requestRender(); }
  function contextLost(event) { event.preventDefault(); lost = true; cancelAnimationFrame(frame); frame = 0; root.classList.add('spatial-fallback'); }
  function contextRestored() { lost = false; root.classList.remove('spatial-fallback'); requestRender(); }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host);
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) requestRender(); else { cancelAnimationFrame(frame); frame = 0; } }); intersection.observe(stage);
  stage.addEventListener('pointermove', pointer); stage.addEventListener('pointerleave', leave);
  motionButton.addEventListener('click', toggle); breezeButton.addEventListener('click', stir);
  window.addEventListener('scroll', requestRender, { passive: true });
  document.addEventListener('visibilitychange', visibility); reduced.addEventListener('change', preference);
  renderer.domElement.addEventListener('webglcontextlost', contextLost); renderer.domElement.addEventListener('webglcontextrestored', contextRestored);
  function dispose() {
    if (disposed) return; disposed = true; cancelAnimationFrame(frame);
    resizeObserver.disconnect(); intersection.disconnect();
    stage.removeEventListener('pointermove', pointer); stage.removeEventListener('pointerleave', leave);
    motionButton.removeEventListener('click', toggle); breezeButton.removeEventListener('click', stir);
    window.removeEventListener('scroll', requestRender); window.removeEventListener('pagehide', pagehide); window.removeEventListener('pageshow', pageshow);
    document.removeEventListener('visibilitychange', visibility); reduced.removeEventListener('change', preference);
    renderer.domElement.removeEventListener('webglcontextlost', contextLost); renderer.domElement.removeEventListener('webglcontextrestored', contextRestored);
    const geometries = new Set(), usedMaterials = new Set();
    scene.traverse(object => { if (object.geometry) geometries.add(object.geometry); if (object.material) usedMaterials.add(object.material); });
    geometries.forEach(geometry => geometry.dispose()); usedMaterials.forEach(material => material.dispose());
    falling.dispose(); environment.dispose(); renderer.dispose(); renderer.domElement.remove();
  }
  function pagehide(event) { if (!event.persisted) dispose(); else { cancelAnimationFrame(frame); frame = 0; } }
  function pageshow() { requestRender(); }
  window.addEventListener('pagehide', pagehide); window.addEventListener('pageshow', pageshow);
  if (import.meta.hot) import.meta.hot.dispose(dispose);
  updateButton(); resize();
  return dispose;
}
