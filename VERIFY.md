# Verification — October 9, 2026 (America/Los_Angeles)

## Confirmed local result

- `npm run preflight` passes: TypeScript, **9 Vitest tests**, production Vite build. Vite reports an 817 kB Three.js chunk (247 kB gzip), a size warning, not a build failure.
- App is running at **http://127.0.0.1:5199**. Production bundle was independently served at 5200 for verification, then that temporary server was stopped.
- Desktop Chrome browser checks at 1440×960; narrow 390×844 layout has no horizontal overflow. Mobile export, physical phone use, Safari, and Firefox are not verified.
- Final default render: `proofs/pull-studio-hero-reveal.mp4`, **H.264**, **1080×1920**, **30 fps**, **240 decoded frames**, **8.000000 seconds**, **6,696,003 bytes**. See `proofs/ffprobe.json`.
- Actual browser playback advanced beyond one second with `videoWidth=1080`, `videoHeight=1920`, `duration=8`, and no media error. All frames decode through FFmpeg without error.
- Additional production-build render: `proofs/flip-24fps.mp4`, **24 fps / 192 frames / 8 seconds**, Silver lighting, gloss, front and real sample reverse. `proofs/flip-ffprobe.json` records dimensions and codec.
- Contact sheets were visually inspected: `proofs/contact-sheet.jpg`, `proofs/flip-contact-sheet.jpg`. Intro exposure was corrected after inspection so the card emerges from darkness. No detected all-black runs. Freeze detection reports the deliberate hero/signature holds after 5.26 seconds, not an export stall.
- Seeking 7s → 1s → 7s produces pixel-identical **live film-preview** canvas data. Full-resolution reference at 7s compared with the decoded MP4 frame: SSIM **0.981307**. Lossy H.264/YUV conversion means export pixels are not expected to be byte-identical. See `proofs/reference-7s.png`, `proofs/export-7s.png`, `proofs/ssim.log`.

## Browser workflow checks

- Actual JPEG file upload; PNG and WebP fixtures derived from the real sample also accepted.
- Invalid HEIC and corrupt JPEG rejected with clear errors; the existing front was retained.
- Front replacement clears sample player/set/shop text. It does not invent details for the new card.
- Independent front/back crop state, contain/fill, zoom, horizontal pan, 90° rotation, reset, and source/standard aspect controls exercised. Front crop persisted after switching to the reverse and back.
- Back upload and complete card turn; light looks, gloss, speed; settings save/restore exercised.
- Logo upload/removal exercised. No-front state blocks export.
- Export cancellation passed, followed by successful export without reloading.
- Simulated missing VideoEncoder in a separate browser tab produced the explicit unsupported-encoder state and disabled MP4 export.
- Current browser run had no application console errors; React's development-tools suggestion is informational.

## Reproduce

```sh
npm ci
npm run preflight
npm run dev
```

The local Playwright CLI was used with `scripts/browser-smoke.js`, `scripts/check-formats.js`, and `scripts/verify-export.js` as `run-code` callbacks. These scripts use this project's absolute M5 path for fixtures/artifact downloads. Example after opening a CLI session named pull-check:

```sh
/Users/m5/.codex/skills/playwright/scripts/playwright_cli.sh --session pull-check run-code "$(cat scripts/verify-export.js)"
sh scripts/verify-media.sh
```

The media script requires FFmpeg/ffprobe and inspects an MP4 already exported by the browser. It does not implement the app's encoder.

## Evidence limits

The fixture is an authentic historical **scan**, not a modern shop photograph. Upload/decode/crop/render/export is demonstrated, but modern autographs, serial printing, slabs, foil masks and irregular photography still need a real shop-card review. No AI artwork was generated. Crop/rotation are manual; no four-corner perspective correction. Shadows and reflection are restrained studio simulations; no physical material recovery. No audio, heavy DOF/bloom, cloud, or rendering server.

## October 9 follow-up — real card and 360 inspection

- `npm run preflight` passed again: TypeScript, 9 tests, production build. Three.js chunk warning remains (~840 kB uncompressed / 253 kB gzip).
- `scripts/verify-inspection.js` passed in Chrome: real pointer drag through a half turn, front/back shortcuts, wheel zoom, keyboard orbit, reset to identical pixels, 7→1→7 film seek, and film pixels unchanged after inspecting the reverse. No page errors. Narrow 390×844 layout has no horizontal overflow. Touch gestures are supported by OrbitControls but were not verified on a physical phone.
- Both actual supplied photos load by default. Original HEICs untouched. Derived face images: front 2378×3330, reverse 2232×3116. Core Image correction uses manually measured corners; original conversions retained in ignored `references/local-card`. No general-purpose extraction feature added.
- Added gloss was reduced after visual review to preserve photographed detail. Real photographic glare remains; this is not reconstructed foil.
- Final `proofs/angel-reese-hero-reveal.mp4`: H.264, 1080×1920, 30 fps, 240 decoded frames, 8.000000 seconds, 6,761,850 bytes. `proofs/angel-reese-ffprobe.json` records the probe. FFmpeg decoded every frame without errors; the contact sheet was inspected and shows front, reverse, and final front/signature.
- Browser playback: 1080×1920, duration 8, currentTime 1.208965, no media error. Directly observed the updated 3D inspect view and both loaded photos in the user's existing in-app browser.
- Evidence: `proofs/angel-reese-inspect-front.png`, `angel-reese-inspect-back.png`, `angel-reese-inspect-drag.png`, `angel-reese-narrow.png`, and `angel-reese-contact-sheet.jpg`.
- Earlier scan-only evidence limits above remain historical. The modern Angel Reese photograph has now been reviewed; autograph/serial/slab fidelity and physical material recovery remain unverified.

## October 9 correction — square sports-card corners

- Replaced the rounded outline with a four-corner rectangle and disabled the body bevel in `src/studio.ts`. Front/back faces, optional foil and reflected faces all share the rectangular outline. Reduced face offsets to match the unbeveled body.
- `npm run preflight` passed: typecheck, 9 existing tests, production build. Existing bundle-size warning remains.
- Visually checked front and back in Chrome plus the user's open in-app browser. Square-corner screenshots in `output/playwright/square-corners-{front,back,film}.png`.
- Exported `proofs/angel-reese-square-corners.mp4`: H.264, 1080×1920, 30fps, 240 decoded frames, 8.000000 seconds, 6,709,231 bytes. Full FFmpeg decode passed. Visually reviewed decoded 7-second frame in `output/playwright/square-corners-export.png`. Probe saved in `proofs/square-corners-ffprobe.json`.
- No photo modifications, dependencies, permission changes, deployment, repository creation or commits.

## Columbia profiles and graded practice — October 9, 2026

- `npm run preflight`: TypeScript passed, 13 Vitest tests passed, production build passed. Existing Three bundle-size warning remains (840 kB minified / 253 kB gzip).
- Playwright `scripts/verify-columbia.js`: supplied Jordan front loads as Graded slab with preserved source aspect; default sway and disabled slow-turn option without reverse; all three brand backgrounds; pixel-identical out-of-order seek; save/restore; background photo import/removal; 390px viewport without horizontal overflow; actual MP4 export.
- Playwright `scripts/verify-columbia-spin.js`: rounded TCG → custom radius → square sports switch; two-photo slow turn; reverse visible at 8 seconds; actual 16-second MP4 export.
- `proofs/columbia-jordan-graded.mp4`: H.264, 1080×1920, 30fps, 240 frames, 8 seconds, 9,002,692 bytes. `proofs/columbia-jordan-ffprobe.json` records metadata. Full FFmpeg decode passed; exported 2-second frame visually inspected.
- `proofs/columbia-reese-slow-turn.mp4`: H.264, 1080×1920, 30fps, 480 frames, 16 seconds, 21,016,866 bytes. `proofs/columbia-reese-ffprobe.json` records metadata. Full FFmpeg decode passed; exported reverse frame visually inspected. Landscape printing on this physical card's reverse remains sideways in portrait orientation, as in the original prepared photo.
- Screenshots: `output/playwright/columbia-graded-inspect.png`, `columbia-graded-spotlight.png`, `columbia-graded-diagonal.png`, `columbia-graded-paper.png`, `columbia-mobile.png`, `columbia-spin-back.png`, plus exported frame PNGs.
- User's existing in-app browser was updated to the Jordan graded sample, Brand tab, paused Spotlight film. Dedicated reference tab closed.
- Limits: slab uses the full holder photograph with illustrative solid edge thickness, not separate transparent case/card/label meshes; supplied Jordan reverse is absent. Logo remains flat with its original white background. TCG rounding is adjustable visual approximation. General HEIC import remains unsupported. No camera capture, public deployment, new dependencies, permission changes, or commit. Local fixtures stay private; Vite's local dist contains them and must not be published unchanged.

## Portable private repository — October 9, 2026

User authorized private GitHub publication for work-computer access. Reviewed all 52 staged paths (~3.9 MB) and scanned tracked text/filenames for credential material: no matches; no private fixture, dependency, build, browser-state, or proof-output paths tracked. Normalized line endings/trailing whitespace in bundled font license text without changing terms; `git diff --cached --check` passed.

A clean staged-file snapshot at `/tmp/columbia-repo-check.PwSHxg` passed fresh `npm ci --no-audit --no-fund` and `npm run preflight` (13 tests, typecheck, production build). Built preview on 127.0.0.1:5201 opened in Chrome with the Ty Cobb demo, Columbia branding, and zero private practice buttons. Local screenshot: `output/playwright/portable-github-checkout.png`. Original user server remains at port 5199. README documents clone/ZIP, Node/npm startup and updates. Existing Three chunk-size warning remains. No new app functionality or public web deployment.
