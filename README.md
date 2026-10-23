# Mohamed Walaa Zain — Portfolio

Bilingual English/Arabic portfolio for a Backend & Web Developer.

Website: https://midowalaa099-commits.github.io/My-Portfolio/

## Develop

Requires Node.js 22.19 or later. Run `npm ci` and `npm run dev`.

## Validate and build

Run `npm test`, `npm run build`, `npm run check:site`, and `npm run verify:preservation`.

Content: `src/en.json`, `src/ar.json`. Shared project destinations: `src/config.js`.

The PDFs in `public/downloads/` link to the public website. The preservation baseline records the approved PDF revisions alongside the preserved assets.

## Publish on GitHub Pages

Build with `npm run build`, copy the contents of `dist/` into `docs/`, and add `docs/.nojekyll`. GitHub Pages publishes the `main` branch's `/docs` folder. Commit source and generated output together after checking changes.

The bank and retry demo use fictional money. Payment integration claims refer to sandbox verification only. Performance figures are dated lab measurements, not real-user metrics.
