# Bloom — the botanical link studio

An original desktop-first Three.js experiment: a sculpted bouquet, fluted ceramic vase, animated butterflies, and a reversible flower-to-QR transformation.

## Run locally

```sh
npm install
npm run dev
```

Open the URL printed by Vite. `npm run build` creates the static `dist` folder. `npm test` checks URL handling, share serialization, and QR decoding across every flower and palette.

## Features

- Procedurally sculpted rose, peony, and dahlia petals, instanced for rendering.
- Five color palettes, wing-flapping butterflies, drag rotation, and ambient-motion controls.
- Flowers travel along staggered arcs into a precise, front-facing floral QR.
- High error correction; untouched function patterns and four-module quiet zone.
- High-resolution PNG downloads.
- Self-contained share URLs: the destination and appearance are stored in the URL fragment. No database, account, external QR API, or backend.
- Reduced-motion support and a static QR fallback if WebGL is unavailable.

## Vercel (optional)

Choose `bloom` as the project root, Vite as the framework, `npm run build` as the build command, and `dist` as the output directory. A localhost share URL only works on the same machine; links generated on a deployment use its public address automatically. No deployment has been made for you.

## Design and assets

Inspired by the bouquet-to-QR interaction at [bubbbly.com/bloom](https://www.bubbbly.com/bloom), created by Ann Nguyen. The interface, geometry, materials, animation, and QR presentation in this project are original implementations; no reference source code or assets were copied. Icons: Lucide (ISC). Fonts: DM Sans and Italiana via Google Fonts (OFL). Runtime packages are bundled; fonts fall back to system fonts offline.

The exported and settled QR share the same drawing function. Automated decoding checks do not replace real camera testing under different lighting and distances.
