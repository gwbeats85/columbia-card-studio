# Columbia Card Studio

A local browser studio for inspecting real sports/TCG card photographs in 3D and exporting branded vertical MP4s. Built with React, TypeScript, Three.js, Vite, and Mediabunny. No account, API key, or rendering server is required.

## Set up on another computer

Prerequisites: **Node.js 22.22.3 or newer compatible Node 22**, npm, and current desktop Chrome or Edge for MP4 export. Node 22.22.3 is recorded in `.nvmrc` for nvm users. The app can run on macOS or Windows; the optional photo-preparation Swift script is Mac-only.

Sign in to GitHub as an account with access to this private repository, then clone it (or use **Code → Download ZIP** and extract it):

```bash
git clone https://github.com/gwbeats85/columbia-card-studio.git
cd columbia-card-studio
npm ci
npm run dev
```

Open **http://127.0.0.1:5199/**. Leave the terminal running; press Ctrl+C to stop. If the port is occupied, stop the other studio server first. No `.env` configuration is needed.

To get later updates from a clean checkout:

```bash
git pull --ff-only
npm ci
npm run dev
```

Keep your own changes before pulling. To validate the app, run `npm run preflight` (typecheck, 13 unit tests, production build). `npm run preview` serves the build on the same local port.

## Card profiles

- **Sports:** square corners.
- **TCG:** rounded corners for Pokémon, One Piece, Lorcana, and similar cards; adjustable custom radius.
- **Graded slab:** preserves the whole photographed holder and label with approximate thickness. This is not a reconstructed transparent case.

Use gentle sway with a single front photo, or add a matching reverse for a slow 360° film. Photos are imported; camera capture is not implemented. Columbia's current logo is a flat PNG, not an editable vector master. Font comparison files are in `references/font-study/`.

## Editor controls

The inspector has four tabs:

- **Card** accepts a required front image, an optional reverse, and an optional shop logo. Crop and alignment are independent per face. The title, set details, and shop name are composed into the film; an uploaded logo replaces the shop name.
- **Brand** compares Columbia backgrounds, changes colors and logo, and imports a custom background photo.
- **Scene** controls Obsidian, Warm, or Silver studio light, intensity, matte/gloss/subtle simulated foil, final card angle, framing, playback speed, and the full card turn. A turn requires a back image.
- **Export** checks the browser's H.264 encoder, then renders 24 or 30 fps at 12 or 18 Mbps. Rendering can be cancelled without changing the scene. The result can be watched in the local preview or downloaded.

**3D inspect** is the default live 3D surface: drag to rotate through 360°, scroll/pinch to zoom, use Front/Back to inspect either face, and Reset to return to the front. Arrow keys orbit and Home resets the focused canvas. Inspection has its own camera and hides the film signature. Film preview is the exact 9:16 composition used by export, including background, reflection, shadow, and signature. The grid and editor chrome never enter the film.

## Artwork and privacy

Images stay in the browser session. Pull Studio does not upload artwork, use accounts, call a rendering server, or send a cloud export. Originals remain untouched; the app uses local object URLs and derived canvas/GPU textures for display. Save and Restore store scene settings in `localStorage` only. Uploaded images live in memory and must be selected again after a reload.

Accepted uploads are JPEG, PNG, or WebP files up to 32 MB and images under 40 megapixels. HEIC is not supported yet. The front and reverse images are treated as photographs: uniform scaling preserves aspect ratio, **Fit entire image** contains the whole source, and **Fill card** or zoom crops it. Horizontal and vertical alignment are normalized pan controls. The card can use the front image's aspect ratio or the standard 2.5 × 3.5 ratio. With no reverse, the back is a neutral unprinted surface; a reverse is required for a full turn.

## Reveal and export contract

The authored reveal is eight seconds at the default 1× speed. Playback speed is bounded to 0.75×–1.25× and changes duration using `8 / speed` seconds for reveal/sway or `16 / speed` for slow turn. Motion is sampled from explicit timestamps: preview and export share the same timeline and renderer, with no wall-clock effects or random particles. Export uses explicit frame timestamps and durations through Mediabunny/WebCodecs, targets H.264 MP4 at 1080 × 1920, and runs only after the browser codec probe succeeds. The current target is desktop Chrome; there is no server or cloud fallback.

The default proof is tracked in [VERIFY.md](./VERIFY.md) when the verification record is present. It covers an 8-second, 1080 × 1920 H.264 MP4 with 240 frames and playback in Chrome. Export is silent; there is no audio track.

A fresh checkout opens the included Ty Cobb archival demo. Personal Angel Reese/Jordan test fixtures, exported films, screenshots, browser settings, and dependencies are excluded from Git. Import your front/back JPEG, PNG, or WebP photos at work. The local practice buttons appear only when optional private fixtures exist.

The included Ty Cobb 1911 image is an archival Library of Congress scan for demonstration, not a user's real photograph or a shop card. Its source and rights note are in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md). The foil option is a restrained surface simulation; genuine modern foil-pattern fidelity has not been confirmed.

## Known limits

Crop is manual and supports fit/fill, zoom, pan, and 90° rotation. There is no in-app automatic corner detection, perspective correction, or card extraction. The supplied Angel Reese pair was manually prepared outside the app. The renderer simulates lighting, gloss, reflection, shadow, and foil; it does not reconstruct a physical finish. Browser codec support is runtime-dependent, so unsupported browsers will leave MP4 export disabled.

See [APP_SPEC.md](./APP_SPEC.md), [DESIGN.md](./DESIGN.md), [RESEARCH.md](./RESEARCH.md), and [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for the current product boundary, visual direction, upstream research, and release notices.
