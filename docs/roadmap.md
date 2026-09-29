# Site plan going forward

This is the accepted direction for future work. It describes planned behavior, not a claim that every feature is already implemented. Deliver the lofi improvements in the order below.

## Hosting and identity

- Keep one repository: `Vishwabelaganti/personalportfolio`.
- Keep the public site at `https://vishwabelaganti.github.io/personalportfolio/`.
- Continue pushing to `main`; GitHub Pages deploys the static site.
- Vercel may remain connected as a spare deployment environment. The portfolio, study space, and gift links must not require it.
- Keep portfolio pages polished and stable. Playground is the home for playful, strange, visual experiments. Each experiment has its own route and may have its own visual style, with consistent navigation and portfolio identity.

Target structure (preserve working routes while organizing source):

```text
/
├── index.html              Portfolio home
├── projects.html           Serious projects
├── experience.html         Experience / résumé material
├── playground.html         Gallery of creative experiments
├── study/                  Study space
├── bloom/                  Flowers and link-sharing gifts
├── arcade/                 Arcade experiments
└── src/experiments/
    ├── study/
    ├── bloom/
    ├── arcade/
    └── shared/
```

The current Bloom implementation lives in `src/experiments/flowers/`; the tree above is the intended organization. Shared portfolio presentation currently lives in `src/shared/`.

## Lofi editor, stage 1: musical guitar and strings

Keep the current browser-generated music system. Do not add a music backend or uploaded audio library.

- Give guitar notes longer decay and release so they overlap and ring out.
- Add light reverb and delay to guitar and strings.
- Add fingerpicking, slow strums, jazz comping, and ambient swell guitar patterns.
- Stagger strummed chord notes by a few milliseconds.
- Add a warm, sustained string layer for long background chords.
- Preserve drums, bass, keys, Rhodes, sax, and existing editable bars.

## Lofi editor, stage 2: editing

- Drag a note's right edge across steps to change its length.
- Add “Loop this bar” to audition edits without waiting through the arrangement.
- Preserve “Play from this bar,” the visible playhead, and queue-on-next-bar behavior.
- Add per-instrument sustain, tone, reverb, and volume controls.
- Preserve WAV export for downloading edited music.

## Bloom: a link-only gift basket

Add “Create a little gift” inside Bloom. The sender chooses:

- Flower type and color palette.
- Basket or bouquet style.
- A title and short letter.
- Goodies: song link, playlist, map pin, ticket, book, movie, article, or tiny surprise note.
- Preset objects such as an envelope, vinyl record, ticket, charm, postcard, tea cup, or book.

Recipient experience:

1. Open the share link and see an animated basket among flowers.
2. Tap the basket to open the bouquet, release petals or butterflies, and reveal the items.
3. Open or tap each item.
4. Show no editing controls in this view.

### URL-only data

Compress and encode the gift payload into the URL fragment:

```text
/bloom/#gift=encoded-data
```

Generate links under the deployed repository subpath. Decode the payload only in the recipient's browser. Example payload:

```json
{
  "version": 1,
  "theme": "rosewater",
  "flowers": "peony",
  "title": "For you",
  "letter": "A small reminder that I’m thinking of you.",
  "items": [
    { "type": "song", "label": "This made me think of you", "url": "..." },
    { "type": "ticket", "label": "Coffee this weekend?" },
    { "type": "note", "label": "Open when you need a smile", "body": "..." }
  ]
}
```

- No database, accounts, server-side storage, or Vercel requirement.
- No uploaded images stored in GitHub or on the site.
- Every edit produces a new share link; old links retain their original gift.
- Preserve existing shared links as the format evolves.

### First version excludes photos

Build gifts around words, themed objects, links, and animation so sharing and QR codes remain reliable. Do not include uploaded photos initially. A future tiny-photo experiment may be optional with a strict compression limit; photos must not become central to the product.

## When to use Vercel

Reconsider Vercel only when an experiment needs private API keys, saved or editable gifts behind the same short URL, uploads, accounts, scheduled reveals, password-protected links, or preview deployments for larger work. Until then, GitHub Pages is the default for the portfolio and Playground.
