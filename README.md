# Vishwa Belaganti — personal portfolio

A static, Vite-built portfolio with a shared pastel design system, substantive project work, and a separate Playground for creative experiments. Compatible with GitHub Pages and Vercel.

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
bloom/index.html           Floral QR creator and recipient view (stable URL)
arcade/index.html          Snake, Pong, Hangman, number guessing, quiz
study/index.html           First study-space prototype
src/
  shared/                  Site theme, navigation, chatbot
  experiments/
    flowers/               Bouquet geometry, animation, QR and sharing
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

GitHub repository: `Vishwabelaganti/personalportfolio`. Enable **GitHub Actions** as the Pages publishing source. Pushes to `main` test, build, and deploy `dist/`. Relative asset paths support the `/personalportfolio/` repository subpath and deployment at a domain root. Existing project source links retain their actual owners.

Vercel is optional: use the repository root, the Vite preset, `npm run build`, and output directory `dist`.

## Floral QR sharing

Creator: `/bloom/`. Shared URLs include `?view=gift` and encode destination/appearance in the fragment. Recipients see the bouquet and QR interaction without editing controls. No database or account is required. The encoded destination is not secret or access-controlled; recipients simply have no editing UI. QR export tests decode all fifteen flower/palette combinations.

## Study space

The first version provides a procedural terrace, five synthesized chimes, day/dusk/night lighting, rain and breeze controls, a wall-clock focus timer, locally saved intention, and existing Proibe audio. See [the asset brief](docs/study-assets.md) for a more detailed environment. Audio never starts automatically.

## Attribution

Floral QR interaction inspired by [bubbbly.com/bloom](https://www.bubbbly.com/bloom). This project’s geometry, interface, and implementation are original. Lucide icons use ISC; Three.js uses MIT; Google Fonts are provided under their respective open font licenses. The user-provided photograph, résumé, and Proibe audio are retained from existing project assets.
