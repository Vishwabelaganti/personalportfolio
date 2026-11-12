# Dual-Space Library of Babel

Run `npm ci` and `npm run dev` at the portfolio root. Open `/babel/` directly or select **Open the library** in Playground. The root `npm test` and `npm run build` cover this route. The build uses relative assets for GitHub Pages under `/personalportfolio/`.

## Upstream

[jrhea/library-of-babel](https://github.com/jrhea/library-of-babel) is the recommended fork. It has a small browser-native BigInt engine and no runtime dependencies. This implementation adapts the extended Euclidean inverse and affine LCG from [revision d7a1c8a](https://github.com/jrhea/library-of-babel/blob/d7a1c8af973e98c413b87205698d28c9c61d850d/js/library-of-babel.js). The modulus now matches each address range. The inverse uses the same Euclidean routine on small operands, which avoids multiplying two page-sized integers during a lookup. The [Apache 2.0 license](../public/licenses/babel-upstream.txt) ships with the static build.

## Files

```text
babel/index.html                          Portfolio route
src/experiments/babel/
  main.jsx                                Vite entry point
  tailwind.css                            Route-local Tailwind utilities
  style.css                               Scoped controls and page grid
  engine/
    lcg.js                                Reversible BigInt affine permutation
    radix.js                              Mixed-radix, base-29 and Unicode codecs
    library.js                            Parity, exact lookup and deterministic browse
    coordinates.js                        Base-36 hexagon and four bounded fields
    probes.js                             Static word ranking and reverse lookups
  ui/
    BabelApp.jsx                          State and optional fragment navigation
    SearchBar.jsx                         Search, autocomplete and mode
    CoordinateNavigator.jsx               Address form and random browse
    PageViewer.jsx                        Ruler, 40 rows and coordinate copy
  data/english-ngrams.json                 Static frequency ranks
scripts/build-babel-ngrams.mjs             Offline frequency table builder
tests/babel.test.js                        Round trips, bounds and probe coverage
```

## Address mapping

A page has 3,200 cells, each one Unicode scalar value. Exact lookup starts at cell one and pads with U+0020 spaces. Leading spaces, case, and punctuation are preserved. Inputs that differ only by trailing spaces yield the same padded page. Unpaired UTF-16 surrogates are rejected.

| Parity | Browse range | Additional exact lookup range |
| --- | --- | --- |
| Even / Ordered | `[C21][V5][C21][V5][space/comma/period]` repeated 640 times | Every other page made from the classic alphabet |
| Odd / Universal Raw | All base-29 pages using lowercase Latin letters, space, comma and period | Every page containing at least one scalar outside the classic alphabet |

Within each space, a page has exactly one address. The two spaces have separate addresses for text in their shared alphabet. A lookup requested in Ordered switches to Universal Raw when it contains a character outside that alphabet. The viewer gives every scalar its own cell and marks nonprinting controls. The exact characters remain recoverable from the address.

Each additional range groups pages by the first slot that breaks its browse pattern. Within that group, the matching prefix, the out-of-pattern symbol, and the unrestricted suffix form a unique rank. Ranking and unranking use a linear number of slot operations with BigInt arithmetic in blocks. Each rank interval gets its own reversible LCG. The page seed is twice the resulting index plus the space parity. Dividing the seed by `4 × 5 × 32 × 410` gives the hexagon and leaves the four local fields in the remainder.

**Random Coordinate** applies a fixed sequence of LCG steps to the current address and stays in the selected browse range. The same start and clicks reproduce the same sequence. A URL fragment `#b1=<hexagon>:<wall>:<shelf>:<volume>:<page>` restores the page, and the navigator accepts a full copied coordinate pasted into **Hexagon**. Badges abbreviate the hexagon. Opening a suggestion reveals the full value in the navigator and makes it available from **Copy coordinate**.

## Build the autocomplete dictionary

The committed JSON contains the top 5,000 bigrams and 3,000 trigrams from ten Project Gutenberg English texts in the US public domain. It stores words in frequency order per context, with alphabetical tie breaks. The original books stay out of the build. The client checks the last two words, then the last word, then common words until it has up to five exact addresses.

To rebuild it, download plain-text editions for Gutenberg books 11, 84, 98, 174, 345, 1260, 1342, 1400, 1661, and 2701. The file URL format is `https://www.gutenberg.org/cache/epub/ID/pgID.txt`. Save the files together and run:

```sh
node scripts/build-babel-ngrams.mjs --corpus /path/to/books/*.txt
```

The same builder accepts tab-separated `word word<TAB>count` bigrams and keeps the top 5,000. Use a source you can redistribute when shipping the output. [Norvig's corpus page](https://norvig.com/ngrams/) lists `count_2w.txt` and describes its provenance.

```sh
node scripts/build-babel-ngrams.mjs --bigrams /path/to/count_2w.txt
```

The builder enforces a 150,000-byte cap. Vite bundles the committed JSON into the Babel route, so typing requires no network requests or service.

## Embed in React or Next.js

Import `BabelApp` and `style.css` from the experiment source. The standalone route uses `tailwind.css`. In an existing Tailwind project, let your Tailwind setup scan the Babel `ui/` directory for utility classes. For the Next.js App Router, import the component through a client wrapper:

```jsx
'use client';

import { BabelApp } from '@/experiments/babel/ui/BabelApp.jsx';
import '@/experiments/babel/style.css';

export default function BabelClient() {
  return <BabelApp />;
}
```

Pass `syncHash` when Babel owns the host page's URL fragment. The standalone route already enables it. To embed the built page instead, use an iframe with a descriptive title and `allow="clipboard-write"` if the host's permissions policy permits it.
