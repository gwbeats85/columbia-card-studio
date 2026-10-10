# Pull Studio current context

## Columbia brand and graded-card update — October 9, 2026

Current app name: Columbia Card Studio. Four inspector tabs: Card / Brand / Scene / Export. Import photos first; camera capture was explicitly deferred by the user. Sports stays square, TCG uses a visually estimated 2.8% corner radius with a custom 0–6% override, and Graded slab preserves the front photo aspect even if standard card ratio is selected. Slab depth and rounded outer silhouette are illustrative; this is a photo-textured holder, not a reconstructed transparent PSA case.

Card tab has private Reese raw and Jordan graded practice fixtures. Jordan uses the supplied front photograph unchanged and an 8-second gentle sway. No reverse is supplied or invented. A 16-second slow 360 turn requires both photographs. Both new motions loop; Hero reveal remains available. Speed affects duration. Inspection stays interactive and independent of the film.

Brand tab compares Spotlight, Diagonal, and Paper backgrounds, retains original studio, accepts a custom background photo, changes accent/base colors and detail, and controls the logo. Actual Columbia website wordmark is a flat 1727×910 PNG on white; no editable logo layers were recovered. See BRAND_RESEARCH.md. Imported images remain session-only; Save scene stores settings locally, and a missing restored background image falls back to Spotlight with a notice.


Local app source: this directory. User authorized full build via attached 3D sports-card cinematic brief on October 9, 2026, then supplied `references/clean-canvas-inspiration.png` and requested a cleaner UI during implementation.

Current surface: a floating left inspector with Card/Scene/Export tabs over an open dark grid. 3D inspect supports drag-to-orbit, scroll/pinch zoom, Front/Back/Reset, and keyboard controls with an independent camera; Film preview is the exact export composition. See DESIGN.md. Do not restore the initial marketing headline or three-column editor.

Stack: React 19.3, TypeScript 5.9, Vite 8.3, Three 0.186.1, Mediabunny 1.61.3, lucide-react. Node 22.22.3 and npm 10.9.8 were used. npm only, package-lock saved in the local file set (Git initialized October 9, 2026).

Renderer/time contract: src/model.ts computes pure timeline/crop math. src/studio.ts owns one reusable Three scene, square-cornered card geometry, source textures, lights, analytic contact shadow, faint mirrored reflection, and canvas signature. src/export.ts builds the same scene at 1080×1920 and feeds explicit frames to Mediabunny/WebCodecs. No MediaRecorder or renamed WebM.

Read README.md for usage, RESEARCH.md for candidate rationale, VERIFY.md for actual proof, HANDOFF.md for continuation. Private GitHub publication was authorized October 9, 2026 for work-computer access. No public site deployment.

October 9 follow-up: user supplied Angel Reese front/back HEICs and requested free 360 inspection plus card-specific open-source inspiration. Private fixture in public/local-card; converted originals in references/local-card; both ignored. Originals in Downloads are untouched. Rebuild aligned faces with `xcrun swift scripts/prepare-local-card.swift`. INSPIRATION.md covers five card-specific projects and visual references. Latest proof: proofs/angel-reese-hero-reveal.mp4 and scripts/verify-inspection.js. The reverse has landscape printing and is mapped sideways to the physical portrait card, not cropped to force upright text.

## Private repository setup

Repository: https://github.com/gwbeats85/columbia-card-studio (private). Local working directory stays here to preserve the current running studio. README contains clone/ZIP and Node/npm startup instructions. Optional personal fixtures and generated proofs are deliberately untracked. Older handoff entries saying there is no Git repo describe prior checkpoints. Browser verification callbacks in scripts retain M5-specific proof paths and sometimes private fixtures; the portable supported verification command is npm run preflight.
