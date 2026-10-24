# Version 6 public-release candidate — NOT PUBLISHED

Final URL: https://midowalaa099-commits.github.io/My-Portfolio/
Base private v6 commit ca395c986eeff4769e5a10ce7df8b7873b465d7e plus accepted Phase 2 changes and release metadata/base-path fixes.

Node >=22.19. npm ci; npm run prepare:pages; npm test; npm run check:site; npm run verify:preservation; npm run check:performance. docs/ contains the staged GitHub Pages payload. .nojekyll included. No .openai Site identity is included to prevent accidental deployment to the private Site.

The default public homepage is indexable. Case studies, learning, legacy and 404 pages remain noindex. The separate MWZ-Private-Performance local preview remains noindex; do not deploy this public payload to the private-preview Site.

Retained share image public/images/og-placeholder.png is 1200×630. User-selected assets: live GitHub CV and portfolio PDF from commit 69f12b8dbe61dbcc3a8cac19dbdcb4a5e132d596, with the lighter original v6 hero set. The two PDF replacements are verified separately; 16 other original public assets remain unchanged; the obsolete legacy JavaScript bundle is explicitly excluded. Decorative symbols were removed as requested. Demo behavior is unchanged. JS hard cap 90 KB gzip; goal 50 KB. Mobile transfer cap 200 KB; EN desktop 210 KB / AR desktop 240 KB; desktop goal 200 KB.

Publication, repository pushes, access changes, alternate-site redirects/noindex changes and Search Console submissions require separate approval. GitHub Pages robots.txt must be at the hostname root to be authoritative; docs/robots.txt here is at the project path. An optional hostname-root robots.txt is provided separately, not installed.

Root landing: /My-Portfolio/ immediately redirects to /My-Portfolio/en/ (JS replace + HTML refresh). GitHub Pages serves the redirect document with HTTP 200, not a server-side 301. This local change is RC05 and awaits review.

Approved PDF update: only three LinkedIn hyperlink targets changed to the current profile. All seven pages render identically; original live PDFs are retained in the separate backup folder.
