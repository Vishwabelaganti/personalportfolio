# Project direction

Read `docs/roadmap.md` before planning or changing site features. It records the user's accepted plan and takes precedence over older architectural proposals; later explicit user instructions take precedence over it.

- Keep `Vishwabelaganti/personalportfolio` as the single repository and GitHub Pages at `https://vishwabelaganti.github.io/personalportfolio/` as the primary deployment, from `main`.
- Keep the portfolio stable and put creative experiments in Playground with their own routes and consistent navigation.
- Keep lofi music generated in the browser; preserve editable bars and WAV export. Improve guitar/strings before expanding editing controls.
- Build Bloom gifts from compressed URL-fragment data with a recipient-only presentation, no backend, accounts, or uploaded photos in the first version. Preserve old gift links.
- Vercel is optional until a feature actually needs server capabilities described in the roadmap.

Use the root package for development. Run appropriate checks for implementation changes with `npm test` and `npm run build`.
