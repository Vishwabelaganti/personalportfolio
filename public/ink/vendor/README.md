# Ink & Current upstream sources

Fetched October 1, 2026. MIT licenses retained alongside the code.

- https://github.com/LingDong-/shan-shui-inf — landscape-worker.js extracts the drawing code from index.html; removes the original UI and runs generation in a worker.
- https://github.com/LingDong-/fishdraw — fish-worker.js retains drawing algorithms and adds a worker entry point without specimen labels or CLI.
- https://github.com/PavelDoGreat/WebGL-Fluid-Simulation — adapted in src/experiments/ink/fluid.js with its MIT notice. Removes promo, analytics, GUI, global input listeners and independent animation loop; disables bloom/sunrays, caps resolution and uses monochrome splats.

All generators are served locally; no upstream runtime dependency.
