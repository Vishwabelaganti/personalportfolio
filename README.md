# Vishwa Belaganti — personal portfolio

A static, Vite-built portfolio with a shared pastel design system, substantive project work, and a separate Playground for creative experiments. Compatible with GitHub Pages and Vercel.

The accepted [site plan going forward](docs/roadmap.md) guides future changes: GitHub Pages is primary, lofi improvements ship in stages, and Bloom evolves into URL-only gift baskets. Sections below describe the current implementation.

## Development

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

## Structure

```text
index.html, projects.html, experience.html, certificates.html
playground.html            Experiment directory, separate from main projects
bloom/index.html           URL-only gift baskets and legacy floral QR links
arcade/index.html          Snake, Pong, Hangman, number guessing, quiz
study/index.html           First study-space prototype
src/
  shared/                  Site theme, navigation, chatbot
  experiments/
    bloom/                 Gift creator, compressed payloads, recipient animation
    flowers/               Legacy bouquet geometry, animation, QR and sharing
    arcade/                Game engines, UI, canvas rendering
    study/                 Terrace scene, audio mixer, timer, notes
public/
  images/                  Existing profile and project images
  files/                   Résumé documents
  audio/                   Existing Proibe audio, loaded on interaction
  favicon.svg
  .nojekyll
tests/                     QR decoding, links, game and timer behavior
archive/legacy/            Earlier scripts/styles retained for reference; not deployed
docs/                      Architecture and study asset brief
.github/workflows/         Build, test, GitHub Pages deployment
```

Only files referenced by Vite and files in `public/` enter the deployed build. Source archives, old standalone configurations, dependencies, and tests are not published as site assets. The root package and lockfile are the authoritative dependency configuration.

## Deployment

GitHub repository: `Vishwabelaganti/personalportfolio`. Primary public site: <https://vishwabelaganti.github.io/personalportfolio/>. Enable **GitHub Actions** as the Pages publishing source. Pushes to `main` test, build, and deploy `dist/`. Relative asset paths support the `/personalportfolio/` repository subpath and deployment at a domain root. Existing project source links retain their actual owners.

Vercel is optional: use the repository root, the Vite preset, `npm run build`, and output directory `dist`.

## Bloom gift sharing

Creator: `/bloom/`. Choose peonies, roses, dahlias, or sunflowers, one of five palettes, and a basket or bouquet. Add a letter and up to six notes or linked goodies with preset objects. Gifts are compressed with browser-native deflate and encoded into `#gift=…`; decoding happens in the recipient's browser. No database, accounts, uploads, or server storage. New edits generate new links; old links retain their contents.

Recipient views have an animated unwrap interaction and tappable objects, with no edit controls. Copy a link, preview the recipient view, or save a QR PNG. Shared links preserve the GitHub Pages subpath. Limits: title/labels 80 characters, letter 600, item notes 300, item URLs 600, complete share URL 2,200. Oversized gifts receive a shortening prompt. A current browser with CompressionStream/DecompressionStream is required. Payloads are bounded and validated, links accept only HTTP(S), and displayed text is not interpreted as HTML.

Original floral QR creation remains at `/bloom/?mode=qr`. Existing `?view=gift#u=…` links and embedded previews continue to work.

## Study space and lofi

The study space includes a procedural courtyard, playable chimes, weather, focus timer, and browser-generated music. The eight-bar editor supports fingerpicking, slow strums, guitar jazz comping, ambient swells, and warm sustained strings alongside keys, Rhodes, sax, bass, melody, and drums. Each instrument has volume, sustain, tone, and reverb controls; pitched layers also share a light delay.

Drag a pitched note's right edge to resize it in steps, or focus its starting step and use Shift + Left/Right. Loop a selected bar or play from it; edits join at the next bar boundary. Save/recall includes instrument settings and edited bars. WAV export renders the complete arrangement with release/reverb tails even when auditioning one bar. Audio starts on interaction. See [the asset brief](docs/study-assets.md) for environment details.

## Attribution

Floral QR interaction inspired by [bubbbly.com/bloom](https://www.bubbbly.com/bloom). This project’s geometry, interface, and implementation are original. Lucide icons use ISC; Three.js uses MIT; Google Fonts are provided under their respective open font licenses. The user-provided photograph, résumé, and Proibe audio are retained from existing project assets.
