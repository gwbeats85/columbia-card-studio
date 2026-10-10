# Columbia Social Studio — reference review and proposed first build

Date: October 10, 2026. Status: planning only; implementation not started. User selected **shop posts: new arrivals, featured cards, prices, events**. Preserve the existing Card Studio and its private GitHub repository. No server restart, commit, push, or new project creation is part of this review.

## Reference and evidence

Source supplied by the user:
`/Users/m5/Movies/MediaBench/20261010-024900-download/Nick - I built a custom social media template creator that generators design...-2108619194715754496.mp4`

ffprobe: 204.862 seconds, 2910×1702, video stream only; no audio to transcribe. Reviewed evenly sampled frames across the clip and full-resolution frames at 0, 65, 145, 200 and 204 seconds. Extracted review material is temporary at `/tmp/columbia-social-review/`; the original was not modified. Timings below are approximate visual observation ranges, not a spoken transcript.

| Clip segment | Observed behavior | Useful Columbia adaptation |
| --- | --- | --- |
| 0:00–0:30 | Graded Jordan photo; price/period/copy fields; background colors, textures, pattern size/strength/position; large live preview | Featured card/slab with asking price and optional short detail line; simple brand backgrounds |
| 0:30–1:20 | Editorial sports photo; alignment/weight controls; translucent text panel, blur, side lines; font choices and text size; image pan/zoom | Product arrival or event photo with headline, date and call to action |
| 1:20–2:00 | Context layout with photo, frame, pattern and typography variations; slide thumbnails build along bottom | A repeatable arrival carousel, one product or card per slide |
| 2:00–2:35 | Graded Pokémon price layout; colors and up/down decorative price-line toggle; editable headline/number | Price or sale badge with a real supplied amount. Do not turn decorative lines into purported market data |
| 2:35–3:15 | Social-post layout; editable attribution/text, platform mark, light/dark post box | Lower priority than store inventory/events; no need for social-link ingestion in the first build |
| 3:15–3:25 | Name/save dialog; header later says Couldn't save; Copy to Figma produces a 5-slides-copied toast | Save/reopen must be proven with images. Clipboard success alone does not prove Figma layer editability |

Persistent visible layout: canvas left/center, controls right, slide thumbnails below, document title/save state at top. Earlier/later, duplicate, delete, individual download, Copy to Figma and Export carousel controls are visible. The clip does not demonstrate a downloaded export, Figma paste, reliable saved-project recovery, team sharing, real market-data integration, or AI generation. Hero is listed as a template choice but not independently evaluated here. Text and numbers in the reference are demo content, not facts to reuse.

## Product direction

A Columbia-specific template editor for producing consistent shop posts quickly. The key reusable idea is **choose a designed layout, supply real content, adjust a small set of controls, export**. Use Columbia's olive/black/white palette, badge logo, optional stars and restrained patterns. The reference's exact art and layouts are inspiration only.

Recommend a separate **Posts** workspace alongside **Card Cinematics**, sharing the existing brand kit and photo-import utilities. Keep their editors separate: the post canvas does not need 3D cameras or a timeline. Retain the working cinematic renderer; its outputs can become optional post media later. No repository split is required for the first prototype; confirm placement at build approval.

## First build

Three template families with useful content variations:

1. **New Arrivals** — one product/card hero photo, short headline, set/product name, optional price, availability and CTA. Duplicate into a multi-slide carousel. Support sealed boxes as well as raw/graded cards.
2. **Featured Card / Slab** — uncropped card/holder image, player/character, year/set/card number, optional grade and asking price, Available / Sold / New badge. Single-card and pair layouts can share the same content model.
3. **Events & Shop Announcements** — event title, date/time, location, short details and CTA; photo optional. Useful for trade nights, release days, buying events, PSA submission reminders and hours notices.

Proposed starter canvases: 1080×1350 portrait, 1080×1080 square, 1080×1920 vertical. These are output presets, not a claim that a platform requires those dimensions. Start by validating portrait composition before adapting the others; resize must reflow rather than stretch the design.

Workspace controls:
- Template picker, large preview, content/style inspector and ordered slide strip.
- Named Columbia brand presets, logo size/placement and light/dark variants; preserve original logo asset until a vector master is approved.
- Import JPEG/PNG/WebP, replace photo, contain/crop, pan/zoom; keep slab labels visible by default.
- Editable copy, prices, CTA, font scale, alignment and photo placement, with overflow feedback.
- Duplicate, reorder, delete, undo/redo and preview the complete carousel.
- Local autosave that includes photos, not only scene settings; downloadable project package containing document data and assets for moving between home and work.
- PNG for one slide or numbered PNGs in a ZIP for a carousel. Explicit export progress/failure handling.

The first proof should demonstrate one photo → one branded post → duplication into three slides → save/reload with images intact → correctly ordered exports. Try two or three reversible visual styles using the same content before choosing a default.

## Build shape and acceptance

Use a shared document model for project, slides, template IDs, content fields, brand settings and local image assets. Renderer and export must consume that same data. Save versioned project data plus asset blobs; browser persistence is convenient, while the explicit project package is the portable backup. Imported source art stays unchanged.

Acceptance checks:
- A long card name or event title cannot silently spill outside the artboard.
- Export respects artboard dimensions, photo crop, line breaks and loaded fonts.
- A graded-card label is preserved with contain mode.
- Reload and project-package round-trip restore every slide and photo.
- Duplicate/reorder/delete/undo preserve image assignments and export order.
- A three-slide carousel ZIP contains three numbered images matching preview.
- Existing Card Cinematics still opens and exports after adding Posts.

Later: editable SVG export tested in both Affinity and Figma, true Copy to Figma, optional caption assistance, background removal, inventory connections, reusable team brand kits, scheduled posting, and animated posts. SVG can preserve shapes/text, but imported photographs remain raster and some effects may need a compatibility fallback; do not promise native Figma layers without testing the actual round-trip.

No AI service is needed for the core editor. Automatic market claims, live prices, social scraping, accounts, team cloud storage, and auto-posting are outside the first proof. All written claims/prices are supplied by the shop.

## October 10 implementation checkpoint

User authorized a narrower first build: two editable Affinity masters, single-post composition, and matching 3D social exports. This is now implemented locally. See SOCIAL_WORKFLOW.md and VERIFY.md. The server was restarted for this build.

Included: two starter families, photo/copy controls, three aspect ratios, manual local save with images, portable JSON import/export, PNG output, matching 3D MP4 formats, transparent card still handoff. Carousel duplication/reorder/ZIP, autosave, and animated posts remain proposed follow-ups, not shipped features. Changes remain uncommitted pending checkpoint approval.
