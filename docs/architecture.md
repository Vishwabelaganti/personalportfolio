# Architecture

The portfolio is a multi-page static site. HTML entry files keep existing links stable. Shared presentation lives in `src/shared`; each experiment owns its styles, application state, and specialized dependencies under `src/experiments`.

Main project work belongs on `projects.html` and the homepage’s selected-work section. Creative experiments belong in `playground.html`, below the main work in the homepage hierarchy. Experiments use their own entry points so visiting the portfolio does not eagerly load the study scene, arcade engines, or flower renderer.

`public/` contains deployable static assets. `archive/legacy/` is retained source history, excluded from the build. All installation and build commands run at the repository root. Avoid adding nested package manifests for new experiments.

The study timer and arcade rules are pure modules with behavior tests. Audio and rendering are separate from those rules. QR tests use a real canvas implementation and decoder. Shared bouquet URLs work under a repository subpath and expose no editing controls on the recipient page.

Study model loading and placement live in `models.js`; runtime GLBs are in its `assets/` folder. `composition.js` owns deterministic musical phrases and validates stored mixer settings. `lofi.js` owns the audio graph, look-ahead scheduling, instrument synthesis, and offline WAV rendering; `mixer-ui.js` owns the controls. The arcade companion has its own module/styles and stores only local personal bests. The supplied raw GLBs stay local in `glbfiles/`; `scripts/prepare-study-models.mjs` makes optimized, versioned copies without overwriting originals.

The homepage owns `src/home/`: its spatial hero progressively loads Three.js, generates its sculpture and petals without external assets, and projects HTML information panels from world-space anchors. Motion can be paused, honors reduced-motion preferences, stops outside the viewport, and disposes GPU resources on teardown. Other portfolio pages do not load the hero module.
