# Architecture

The portfolio is a multi-page static site. HTML entry files keep existing links stable. Shared presentation lives in `src/shared`; each experiment owns its styles, application state, and specialized dependencies under `src/experiments`.

Main project work belongs on `projects.html` and the homepage’s selected-work section. Creative experiments belong in `playground.html`, below the main work in the homepage hierarchy. Experiments use their own entry points so visiting the portfolio does not eagerly load the study scene, arcade engines, or flower renderer.

`public/` contains deployable static assets. `archive/legacy/` is retained source history, excluded from the build. All installation and build commands run at the repository root. Avoid adding nested package manifests for new experiments.

The study timer and arcade rules are pure modules with behavior tests. Audio and rendering are separate from those rules. QR tests use a real canvas implementation and decoder. Shared bouquet URLs work under a repository subpath and expose no editing controls on the recipient page.

Study model loading and placement live in `models.js`; runtime GLBs are in its `assets/` folder. `composition.js` owns deterministic musical phrases and validates stored mixer settings. `lofi.js` owns the audio graph, look-ahead scheduling, instrument synthesis, and offline WAV rendering; `mixer-ui.js` owns the controls. The arcade companion has its own module/styles and stores only local personal bests. The supplied raw GLBs stay local in `glbfiles/`; `scripts/prepare-study-models.mjs` makes optimized, versioned copies without overwriting originals.

The homepage uses a static introduction in normal document flow with a large, reserved-size portrait. `src/home/main.js` loads only the hero CSS; the former Three.js hero module is no longer imported. There are no sticky scene panels or scroll-driven transforms on the homepage.

Bloom's `src/experiments/bloom/entry.js` routes current gifts and the creator to `bloom/main.js`, while preserving legacy `#u` recipient links and QR previews in `flowers/main.js`. `bloom/gift.js` validates versioned payloads, compresses them using browser streams, limits both URL size and decoded size, and preserves the deployment subpath. No gift persistence or server is involved. SVG/CSS provides the new gift visuals, including sunflowers and reduced-motion behavior.

The lofi audio graph has independent instrument tone filters and reverb sends, with a shared delay and master bus. Live and offline rendering use the same voices and strum offsets. The editor stores note durations in beats; one grid step equals one quarter beat. Bar looping affects live transport only, and exports always contain all eight bars.

Bloom creator navigation exposes Bouquet and Gift Box modes. Recipient links omit this creator navigation. Gift types own their form schema, keepsake appearance, metadata, and recipient action in `bloom/types.js`; optional typed details extend version 1 without breaking old gifts. New gifts default to a ribbon-tied box. Bouquet QR mode also supports sunflowers.
