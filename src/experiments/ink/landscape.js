// Rasterize the original SVG's ordered brush marks progressively. Only two
// display canvases animate; thousands of SVG elements never enter the live DOM.
export class InkLandscape {
  constructor(mount, reflection) {
    this.mount = mount;
    this.reflection = reflection;
    this.canvas = document.createElement('canvas');
    this.mirror = document.createElement('canvas');
    this.paper = document.createElement('canvas');
    this.paper.width = 2400;
    this.paper.height = 1200;
    this.brush = this.paper.getContext('2d');
    this.mount.replaceChildren(this.canvas);
    this.reflection.replaceChildren(this.mirror);
    this.marks = [];
    this.progress = 0;
    this.elapsed = 0;
    this.pan = 0;
  }
  load(svg, immediate = false) {
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    this.marks = [...doc.querySelectorAll('polyline')].map(node => {
      const values = node.getAttribute('points').trim().split(/[\s,]+/).map(Number);
      const path = new Path2D();
      for (let i = 0; i < values.length; i += 2) {
        if (i === 0) path.moveTo(values[i], values[i + 1]);
        else path.lineTo(values[i], values[i + 1]);
      }
      return { path, fill: node.style.fill, stroke: node.style.stroke, width: Number.parseFloat(node.style.strokeWidth) || 0 };
    });
    this.replay(immediate);
  }
  replay(immediate = false) {
    this.brush.setTransform(1, 0, 0, 1, 0, 0);
    this.brush.clearRect(0, 0, this.paper.width, this.paper.height);
    this.brush.setTransform(1.5, 0, 0, 1.5, 0, 0);
    this.progress = 0;
    this.elapsed = immediate ? 10 : 0;
    this.paint(0, false);
  }
  paint(dt, drift = true) {
    this.elapsed += dt;
    if (drift) this.pan += dt;
    const end = Math.min(this.marks.length, Math.floor(this.marks.length * this.elapsed / 10));
    for (; this.progress < end; this.progress++) {
      const mark = this.marks[this.progress];
      if (mark.fill && mark.fill !== 'none') { this.brush.fillStyle = mark.fill; this.brush.fill(mark.path); }
      if (mark.width > 0 && mark.stroke !== 'none') {
        this.brush.strokeStyle = mark.stroke; this.brush.lineWidth = mark.width; this.brush.stroke(mark.path);
      }
    }
    for (const [canvas, host, reflect] of [[this.canvas, this.mount, false], [this.mirror, this.reflection, true]]) {
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      const width = Math.round(host.clientWidth * ratio), height = Math.round(host.clientHeight * ratio);
      if (!width || !height) continue;
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, width, height);
      // A wider-than-viewport scroll keeps a slow, seamless back-and-forth drift.
      const scale = Math.max(width * 1.25 / this.paper.width, height / this.paper.height);
      const drawWidth = this.paper.width * scale, drawHeight = this.paper.height * scale;
      const x = -(drawWidth - width) * (.5 + .46 * Math.sin(this.pan / 42));
      const y = -(drawHeight - height) * (reflect ? 1 : .63);
      context.drawImage(this.paper, x, y, drawWidth, drawHeight);
    }
  }
}
