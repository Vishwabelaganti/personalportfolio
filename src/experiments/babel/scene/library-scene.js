import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createLibraryScene(host, onSelect, onHover, onFailure) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0xe9eeea);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-label', 'Four library walls, each with five shelves and thirty-two books. Click a book to open it.');
  renderer.domElement.setAttribute('role', 'img');
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.minPolarAngle = .2;
  controls.maxPolarAngle = Math.PI / 2.05;
  controls.target.set(0, 2, -1);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x809284, 2.6));
  const sun = new THREE.DirectionalLight(0xfff5df, 3.5);
  sun.position.set(-5, 12, 12);
  scene.add(sun);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const materials = [];
  const textures = [];
  function material(color, options = {}) {
    const result = new THREE.MeshStandardMaterial({ color, roughness: .85, ...options });
    materials.push(result);
    return result;
  }
  function box(parent, width, height, depth, x, y, z, mat) {
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.scale.set(width, height, depth);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }
  function label(parent, text, x, y, z, width = 1.5) {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#263c31';
    ctx.font = '500 40px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 192, 48);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.push(texture);
    const mat = new THREE.SpriteMaterial({ map: texture, depthTest: true });
    materials.push(mat);
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(x, y, z);
    sprite.scale.set(width, width / 4, 1);
    parent.add(sprite);
  }
  const wood = material(0x9ca99c);
  const back = material(0xc2cec3);
  const floor = material(0xdce4dc);
  box(scene, 24, .14, 14, 0, -.15, 0, floor);
  const grid = new THREE.GridHelper(24, 24, 0xb9c8ba, 0xd0dbd1);
  grid.position.y = -.07;
  scene.add(grid);

  const walls = [];
  const shelfHighlights = [];
  const books = [];
  const count = 4 * 5 * 32;
  const bookMaterial = material(0xffffff);
  const instances = new THREE.InstancedMesh(geometry, bookMaterial, count);
  instances.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  scene.add(instances);
  const colors = [0x6d8174, 0x9eae97, 0xc5b79a, 0xb9c6b3, 0x526d64, 0xa49179, 0x778f86, 0xd5ccb4];
  const matrix = new THREE.Matrix4();
  const local = new THREE.Object3D();

  for (let wall = 1; wall <= 4; wall++) {
    const angle = THREE.MathUtils.degToRad((wall - 2.5) * 43);
    const group = new THREE.Group();
    group.position.set(7.1 * Math.sin(angle), 0, -7.1 * Math.cos(angle) + 3);
    group.rotation.y = -angle;
    scene.add(group);
    walls.push(group);
    box(group, 4.9, 4.2, .16, 0, 2.1, -.25, back);
    box(group, .12, 4.25, .7, -2.48, 2.1, 0, wood);
    box(group, .12, 4.25, .7, 2.48, 2.1, 0, wood);
    box(group, 5.1, .13, .75, 0, 4.25, 0, wood);
    label(group, 'WALL ' + wall, 0, 4.7, .15, 2.2);
    group.updateMatrixWorld(true);

    for (let shelf = 1; shelf <= 5; shelf++) {
      const base = .2 + (5 - shelf) * .8;
      box(group, 4.9, .09, .78, 0, base, 0, wood);
      const highlight = box(group, 4.9, .055, .03, 0, base + .05, .41, material(0xb48c45));
      highlight.visible = false;
      shelfHighlights.push({ wall, shelf, mesh: highlight });
      label(group, String(shelf), -2.78, base + .35, .4, .38);
      for (let volume = 1; volume <= 32; volume++) {
        const id = books.length;
        const height = .53 + ((volume * 7 + shelf * 3 + wall) % 5) * .033;
        local.position.set((volume - 16.5) * .145, base + .06 + height / 2, .07);
        local.scale.set(.12, height, .53);
        local.updateMatrix();
        matrix.multiplyMatrices(group.matrixWorld, local.matrix);
        instances.setMatrixAt(id, matrix);
        const color = new THREE.Color(colors[(volume + shelf * 3 + wall * 2) % colors.length]);
        instances.setColorAt(id, color);
        books.push({ wall, shelf, volume, color, matrix: matrix.clone() });
      }
    }
  }
  instances.instanceMatrix.needsUpdate = true;
  instances.instanceColor.needsUpdate = true;

  const selected = new THREE.Mesh(geometry, material(0xc4873b, { emissive: 0x84541c, emissiveIntensity: .18 }));
  selected.matrixAutoUpdate = false;
  scene.add(selected);
  const outlineGeometry = new THREE.EdgesGeometry(geometry);
  const outlineMaterial = new THREE.LineBasicMaterial({ color: 0xe9b14c });
  const outline = new THREE.LineSegments(outlineGeometry, outlineMaterial);
  outline.matrixAutoUpdate = false;
  scene.add(outline);

  let frame = 0;
  let disposed = false;
  let focusWall = null;
  let selection = { wall: 1, shelf: 1, volume: 1 };
  function render() {
    frame = 0;
    if (!disposed) renderer.render(scene, camera);
  }
  function invalidate() {
    if (!frame && !disposed) frame = requestAnimationFrame(render);
  }
  function view(wall = null) {
    focusWall = wall;
    const narrow = Math.max(1, 1.6 / camera.aspect);
    if (wall) {
      const group = walls[wall - 1];
      camera.position.copy(group.localToWorld(new THREE.Vector3(0, 3.1, 7.8 * narrow)));
      controls.target.copy(group.localToWorld(new THREE.Vector3(0, 2.15, .1)));
    } else {
      camera.position.set(0, 6.5 * narrow, 14 * narrow);
      controls.target.set(0, 1.7, -.8);
    }
    controls.update();
    invalidate();
  }
  function resize() {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    view(focusWall);
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  controls.addEventListener('change', invalidate);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  function hit(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2);
    raycaster.setFromCamera(pointer, camera);
    const intersection = raycaster.intersectObject(instances)[0];
    return intersection ? books[intersection.instanceId] : null;
  }
  let down = null;
  let hovered = null;
  function pointerDown(event) { down = { x: event.clientX, y: event.clientY }; }
  function pointerMove(event) {
    if (down) return;
    const book = hit(event);
    if (book !== hovered) {
      hovered = book;
      renderer.domElement.style.cursor = book ? 'pointer' : 'grab';
      onHover(book ? 'Wall ' + book.wall + ' · Shelf ' + book.shelf + ' · Book ' + book.volume : '');
    }
  }
  function pointerUp(event) {
    const clicked = down && Math.hypot(event.clientX - down.x, event.clientY - down.y) < 6;
    down = null;
    if (!clicked) return;
    const book = hit(event);
    if (book) {
      onSelect({ wall: book.wall, shelf: book.shelf, volume: book.volume });
      view(book.wall);
    }
  }
  function pointerLeave() { down = null; hovered = null; onHover(''); }
  function contextLost(event) { event.preventDefault(); onFailure(); }
  const canvas = renderer.domElement;
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointerleave', pointerLeave);
  canvas.addEventListener('pointercancel', pointerLeave);
  canvas.addEventListener('webglcontextlost', contextLost);
  resize();

  return {
    select(coordinate) {
      selection = coordinate;
      const book = books[(selection.wall - 1) * 160 + (selection.shelf - 1) * 32 + selection.volume - 1];
      selected.matrix.copy(book.matrix);
      // Pull the selected book out from the shelf so it is visible at every camera angle.
      const front = new THREE.Vector3(0, 0, .16).transformDirection(walls[book.wall - 1].matrixWorld).multiplyScalar(.16);
      selected.matrix.setPosition(new THREE.Vector3().setFromMatrixPosition(book.matrix).add(front));
      outline.matrix.copy(selected.matrix);
      outline.matrix.scale(new THREE.Vector3(1.1, 1.06, 1.06));
      for (const shelf of shelfHighlights) shelf.mesh.visible = shelf.wall === selection.wall && shelf.shelf === selection.shelf;
      if (focusWall !== null && focusWall !== selection.wall) view(selection.wall);
      invalidate();
    },
    overview: () => view(),
    focus: () => view(selection.wall),
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.removeEventListener('change', invalidate);
      controls.dispose();
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointerleave', pointerLeave);
      canvas.removeEventListener('pointercancel', pointerLeave);
      canvas.removeEventListener('webglcontextlost', contextLost);
      geometry.dispose();
      outlineGeometry.dispose();
      outlineMaterial.dispose();
      grid.geometry.dispose();
      grid.material.dispose();
      instances.dispose();
      materials.forEach(mat => mat.dispose());
      textures.forEach(texture => texture.dispose());
      renderer.dispose();
      canvas.remove();
    },
  };
}
