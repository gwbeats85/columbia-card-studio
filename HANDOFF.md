# Columbia Card Studio handoff

## October 10 — GitHub publication checkpoint

User approved committing and pushing the completed Posts workspace, Affinity starters, social exports, and cleaner UI in response to the public-repository confirmation. Publishing target: `gwbeats85/columbia-card-studio`, branch `main`. The entries below are historical; their uncommitted/private status descriptions predate this checkpoint.

Pre-push verification: `npm run preflight` passed (20 tests, typecheck, production build); `git diff --check` passed. Candidate files were scanned for credentials and private fixture paths. Embedded SVG images match the already included Columbia logo and archival Ty Cobb demo by SHA-256. Private photographs, generated exports, browser state, dependencies, and local build outputs remain ignored. README includes setup and local save behavior. No app hosting deployment is part of this checkpoint.

At work: clone or download the repository, install Node 22, then run `npm ci` and `npm run dev`. Open `http://127.0.0.1:5199/`.

## Latest: private GitHub repository

User authorized creating and publishing a private repository to download at work. Target: https://github.com/gwbeats85/columbia-card-studio. README now includes Node 22, clone/ZIP, npm ci, npm run dev, and update instructions; .nvmrc pins tested Node 22.22.3. Git ignores private photos, build outputs, proof media, browser caches and secret/runtime files. The portable checkout includes the archival demo, brand assets and licensed font study. No app behavior changes. Existing local photos and current server remain intact.


## Columbia brand and graded-card update — October 9, 2026

Current app name: Columbia Card Studio. Four inspector tabs: Card / Brand / Scene / Export. Import photos first; camera capture was explicitly deferred by the user. Sports stays square, TCG uses a visually estimated 2.8% corner radius with a custom 0–6% override, and Graded slab preserves the front photo aspect even if standard card ratio is selected. Slab depth and rounded outer silhouette are illustrative; this is a photo-textured holder, not a reconstructed transparent PSA case.

Card tab has private Reese raw and Jordan graded practice fixtures. Jordan uses the supplied front photograph unchanged and an 8-second gentle sway. No reverse is supplied or invented. A 16-second slow 360 turn requires both photographs. Both new motions loop; Hero reveal remains available. Speed affects duration. Inspection stays interactive and independent of the film.

Brand tab compares Spotlight, Diagonal, and Paper backgrounds, retains original studio, accepts a custom background photo, changes accent/base colors and detail, and controls the logo. Actual Columbia website wordmark is a flat 1727×910 PNG on white; no editable logo layers were recovered. See BRAND_RESEARCH.md. Imported images remain session-only; Save scene stores settings locally, and a missing restored background image falls back to Spotlight with a notice.


## Latest correction — square corners

User requested square sports-card corners. `src/studio.ts` now uses a rectangular outline, no body bevel, and face offsets fitted to the straight body. Front/back/foil/reflection and preview/export share that geometry. `APP_SPEC.md` and `CONTEXT.md` record the correction. `npm run preflight` passed; front/back screenshots and actual 1080×1920 MP4 checked. Latest film: `proofs/angel-reese-square-corners.mp4`; preview: `output/playwright/square-corners-front.png`. Details in VERIFY.md. No source-photo changes, permissions, publishing or Git checkpoint; still local files outside a Git repo. Next: review better-lit source photos when available.

## Previous follow-up

The app now opens **3D inspect** with Will’s supplied Angel Reese front and back. Drag to orbit through 360°, wheel/pinch to zoom, Front/Back/Reset shortcuts, arrow-key orbit and Home reset. The inspection camera is independent of Film preview/export. Reduced the gloss response after testing the real photograph. Latest film: `proofs/angel-reese-hero-reveal.mp4`; latest screenshot: `proofs/angel-reese-inspect-front.png`.

Changed `src/studio.ts`, `src/App.tsx`, `src/styles.css`, private local image fixtures, `.gitignore`, documentation, and browser checks. Added `scripts/prepare-local-card.swift`, `scripts/verify-inspection.js`, and `INSPIRATION.md` with six direct card references and captured examples. No dependency changes this follow-up.

Commands: `sips` local HEIC conversion; `xcrun swift scripts/prepare-local-card.swift` manual alignment; `npm run preflight`; Playwright inspection/export check; ffprobe/full FFmpeg decode/contact-sheet review. All passed. Original HEICs unchanged. No permissions changed, external upload, publish, or Git checkpoint. Private fixture folders are ignored but Vite copies public files into local dist; do not publish that build as-is.

Current gaps: photos retain baked-in glare, reverse printing is landscape, general HEIC upload still unsupported (these two were prepared locally), no automatic in-app corner detection or recovered foil map. Next useful review: try the loaded card from several angles; consider a manually masked, angle-reactive foil option using the research references. Work remains local and uncommitted because this folder has no Git repository.

## Initial delivery

Local React app at **http://127.0.0.1:5199**, one eight-second hero reveal, actual verified vertical H.264 MP4 export, and the user's revised cleaner UI. Final primary artifact: `proofs/pull-studio-hero-reveal.mp4`. Review image: `proofs/clean-editor.png`.

## Files created

- `src/App.tsx`, `src/styles.css`, `src/main.tsx`: floating Card/Scene/Export inspector, canvas/film views, uploads/crops, playback, signature, settings reuse and export states.
- `src/model.ts`, `src/model.test.ts`: pure timeline and uniform crop geometry, asset validation; 9 tests.
- `src/studio.ts`: source-textured thin rounded card, matte/gloss/optional foil, lighting, reflection, shadow and shared overlay compositor.
- `src/export.ts`: codec probe, fixed-frame WebCodecs/Mediabunny MP4, progress, cancellation and cleanup.
- `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore`: npm project setup.
- `public/samples/*`, `public/favicon.svg`: labeled archival scan fixtures and app icon.
- `RESEARCH.md`, `THIRD_PARTY_NOTICES.md`, `APP_SPEC.md`, `DESIGN.md`, `README.md`, `AGENTS.md`, `CONTEXT.md`, `VERIFY.md`, `HANDOFF.md`: research, license notices, setup, boundaries and re-entry.
- `scripts/*`, `proofs/*`, `references/clean-canvas-inspiration.png`: repeatable browser/media checks, actual renders, metadata, inspected frames and supplied UI direction.

## Dependencies / checks

Added local project dependencies React, ReactDOM, Three.js, Mediabunny and lucide-react; development dependencies TypeScript, React/Three typings, Vite/React plugin and Vitest. Exact pins/lock in package files. No R3F, Remotion, GSAP, ffmpeg.wasm, or unlicensed candidate code copied.

`npm run preflight` passed. Browser upload/crop/error/settings/cancel/unsupported-codec checks passed. Final MP4: 1080×1920 H.264, 8.000000s, 30fps, 240 decoded frames; actual playback succeeded. Production build separately exported a 24fps/192-frame full turn. See VERIFY.md for evidence and limits.

## Runtime / permissions / Git

Only project-local files and npm packages were added. Research/sample images were downloaded from primary upstream/Library of Congress sources. Browser verification ran locally. Dev server listens on 127.0.0.1:5199; temporary production verifier on 5200 stopped. No system permissions changed, global tools installed, credentials, accounts, cloud, uploads, commits, repositories, pushes or public deployments.

This folder is **not a Git repo**. All work exists locally. A private Git checkpoint can be chosen after review; do not auto-commit or publish it.

## Remaining limits and useful next improvements

1. Completed modern-photo review with Angel Reese front/back. Autograph, serial printing and slabs still need separate examples.
2. Add four-corner perspective alignment if typical phone photos include table/background or skew. Current fit/fill/pan/90° rotation never stretch the source but do not extract a card automatically.
3. Add user-painted foil masks and a saved scene-file download only after the core visual result is approved. Current foil is a restrained simulated overlay, not reconstructed real finish.

No audio, physical-phone export proof, Safari/Firefox export proof or material recovery. A very wide photograph may need standard card ratio and manual crop. Long filenames are truncated visually; the file itself remains local and unchanged.

## Avoid repeating

- Do not replace the user's supplied card artwork with generative output.
- Keep the clean single-inspector UI; the user rejected the busier direction.
- The intro needs the material exposure ramp as well as animated lights; otherwise the environment reveals the card too early.
- Three r186 removed PCFSoftShadowMap; PCFShadowMap is used. RectAreaLightUniformsLib must be initialized.
- Vite 8 uses Rolldown; object-form manualChunks failed. Current function form builds.
- Browser smoke scripts need role-based combobox lookup and canonical numeric range values (`1.2`, not `1.20`). These were test-harness issues, not app failures.

Next-session prompt: “Open Pull Studio at /Users/m5/Workspaces/apps/prototypes/pull-studio, read HANDOFF.md and VERIFY.md, then use the loaded Angel Reese card in 3D inspect and compare its exported film before extending foil effects.”

## Columbia completion record

Changed: `src/App.tsx`, `src/model.ts`, `src/model.test.ts`, `src/studio.ts`, `src/styles.css`, new `src/backgrounds.ts`, `index.html`, brand PNGs, private Jordan fixture, two browser verification scripts, and project documentation/research. Existing npm dependency versions unchanged.

Commands: `npm run preflight`; Playwright CLI running `scripts/verify-columbia.js` and `scripts/verify-columbia-spin.js`; ffprobe and full FFmpeg decode for both new MP4s. All final checks passed; see VERIFY.md for metadata and screenshots. No new permissions or external upload. Directory remains outside Git; no commit/checkpoint performed. App remains running at http://127.0.0.1:5199/ with Jordan/Spotlight ready in the user tab.

Next review: compare Spotlight / Diagonal / Paper, then provide a matching graded reverse photo to try the complete turn. More accurate clear-holder geometry and editable vector logo layers are separate follow-ups.

## October 10: social starter build

Implemented and verified locally. New Posts workspace opens by default; 3D cards remain a top-level switch. Two editable Affinity masters and SVG alternatives are bundled in `public/templates/`, with actual Affinity-exported background PNGs. Canonical design masters: `/Users/m5/Workspaces/design/PROJECTS/active/columbia-social-templates/`. Featured Card is open in Affinity. Follow `SOCIAL_WORKFLOW.md` for the colleague training path.

Changed: App/main/studio/export integration; new Workspace/Posts components, post model/styles/tests, export dimensions/tests, template assets, browser proof scripts, APP_SPEC/README/plan/workflow/verification/handoff docs. No dependencies added. Used Affinity's existing MCP permissions; no accounts, uploads, permission changes, or social publishing.

Commands: npm run preflight (20 tests + typecheck/build), git diff --check, Playwright verify-posts and verify-social-video, sips dimensions, ffprobe, complete ffmpeg decode. All pass; see VERIFY.md for proof details and limitations.

The Vite process is running on 127.0.0.1:5199. Changes are **uncommitted and unpushed**; prior private GitHub repo does not yet contain this addition. Next: compare the two starter looks and practice changing a background in Affinity; approve a Git checkpoint when ready to move this version to work. Carousel/event families and animated Posts remain follow-ups.

## October 10, 03:22 — Posts UI refinement
User chose the tash reference layout. Posts now uses a large left canvas, right collapsible inspector, neutral chrome, top save/export and Project menu, and bottom template chooser. Header displays real local save state. Workspace switching is integrated into the Posts header; existing 3D navigation remains available.
Changed this pass: Posts.tsx/posts.css, Workspace.tsx/workspace.css, verify-posts.js and supporting APP_SPEC/DESIGN/workflow/README/VERIFY/HANDOFF docs. Verified via npm run preflight (20 tests + build/typecheck), browser flow and desktop/mobile screenshots. No new dependencies, permission changes, or external writes. Server remains running at localhost:5199. Existing and new changes remain uncommitted/unpushed. Next: user review of the cleaner layout, then a requested Git checkpoint.
