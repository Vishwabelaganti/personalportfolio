# Architecture

The portfolio is a multi-page static site. HTML entry files keep existing links stable. Shared presentation lives in `src/shared`; each experiment owns its styles, application state, and specialized dependencies under `src/experiments`.

Main project work belongs on `projects.html` and the homepage’s selected-work section. Creative experiments belong in `playground.html`, below the main work in the homepage hierarchy. Experiments use their own entry points so visiting the portfolio does not eagerly load the study scene, arcade engines, or flower renderer.

`public/` contains deployable static assets. `archive/legacy/` is retained source history, excluded from the build. All installation and build commands run at the repository root. Avoid adding nested package manifests for new experiments.

The study timer and arcade rules are pure modules with behavior tests. Audio and rendering are separate from those rules. QR tests use a real canvas implementation and decoder. Shared bouquet URLs work under a repository subpath and expose no editing controls on the recipient page.
