# Pull Studio — prototype build contract

Authorized by the attached October 9, 2026 build brief. A local React/TypeScript app turns one authentic uploaded card into an eight-second vertical studio reveal. Canonical home: this folder. No repository created or publishing implied.

## First proof
- Three.js scene with a square-cornered, thin physical card, original front/back texture, calibrated studio lights, soft floor shadow/reflection and deliberate camera motion.
- Pure timestamp sampling shared by live preview and frame export. No wall-clock effects or random particles.
- H.264/AVC MP4 via browser WebCodecs and Mediabunny, 1080×1920, 24/30 fps. Explicit codec support probe, progress, cancellation, download. Actual MP4 must be decoded and inspected before completion.
- Upload JPEG/PNG/WebP, non-stretching contain/cover with independent alignment/zoom per face; optional reverse and neutral unprinted reverse fallback; original image ratio or standard 2.5:3.5.
- Compact Card / Scene / Export inspector with studio lighting choices, camera/rotation/speed, optional text/logo and consistent preview/export overlays.

## Visual question
One authored hero reveal; compare three lighting treatments (Obsidian, Warm archival, Silver) and tune intensity, tilt, camera framing. User-supplied clean canvas reference: floating inspector, large open grid, compact playback dock and exact film-preview toggle. These remain useful scene controls, not a permanent brand decision.

## Boundaries
No generative alteration of source art, accounts, cloud uploads, card recognition/grading, public deploy, multitrack editor or new background services. Sample is a labeled Library of Congress historical scan, not the user's shop card. Surface finish is a simulation, not physical material recovery; optional foil is disabled by default.

## Verification
Typecheck, focused timeline/crop tests, production build, desktop browser upload/crop/preview/error/cancel checks, real exported file checked by ffprobe and decoded frames plus browser playback. Record results and remaining gaps in VERIFY.md and HANDOFF.md.

## October 9 inspection extension
The default 3D inspect canvas supports direct drag through 360 degrees, wheel/pinch zoom, front/back/reset views, and keyboard orbit. Its camera is independent of the authored film camera. Film preview and export retain the sampled timeline. Load Will's supplied Angel Reese front/reverse as local test fixtures, using deterministic manual corner alignment on derived PNGs; retain the original HEICs. This does not add automatic extraction or regenerate artwork.

## Sports-card corners
User correction: straight edges meeting at square 90-degree corners. No rounding or bevel on the body, either artwork face, foil overlay, or reflection. Shared geometry applies to 3D inspection, film preview, and exported video.

## Columbia brand studio extension — October 9
User authorized a Columbia Sports Cards branded local studio and chose importing photos first. Keep the existing inspector; add Sports (square), Rounded TCG, Graded slab and custom corner profiles. TCG curvature references the visible Lorcana Card Maker silhouette, with a tunable radius rather than claiming official manufacturer dimensions. Graded mode keeps the complete holder/label photograph, source proportions, and an approximate thicker edge; it does not verify grades or reconstruct transparent plastic. Practice fixture: supplied Michael Jordan PSA front; no reverse supplied.

Add switchable Columbia background studies (Spotlight, Diagonal, Paper) plus original Studio and local background-image upload; editable brand colors, optional official web logo, deterministic slow full turn (back required) and gentle sway (front-only), persistent settings, and the same actual H.264 export. Store all images locally. No camera capture, generated card art, accounts or publishing. Public logo assets remain unmodified flat rasters, not claimed as layered source files. Preserve precise source URLs and brand/reference notes.
