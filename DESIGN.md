# UI direction — October 9, 2026

The user supplied `references/clean-canvas-inspiration.png` during the build and explicitly asked for a cleaner UI. Adopt its spatial layout: full open grid canvas, one floating left inspector, compact controls, restrained neutral charcoal. Do not copy the card generator's artwork or card-editing features.

The initial three-column editorial editor was superseded. Current inspector tabs: Card, Scene, Export. 3D inspect has direct 360-degree orbit, zoom, Front/Back/Reset controls, and hides signature text; Film preview shows the exact 9:16 composition, background and signature used for export. The grid is editor chrome and is never exported. Inspection uses a separate OrbitControls camera with readable lights on either side; Film preview and export retain the deterministic sampled camera. Inspection replaces the playback dock with a compact interaction hint and controls.

Three useful lighting choices remain: Obsidian (default), Warm, Silver. These are scene settings, not three conflicting app layouts. No permanent brand decision or production deployment implied.

## Columbia brand and graded-card update — October 9, 2026

Current app name: Columbia Card Studio. Four inspector tabs: Card / Brand / Scene / Export. Import photos first; camera capture was explicitly deferred by the user. Sports stays square, TCG uses a visually estimated 2.8% corner radius with a custom 0–6% override, and Graded slab preserves the front photo aspect even if standard card ratio is selected. Slab depth and rounded outer silhouette are illustrative; this is a photo-textured holder, not a reconstructed transparent PSA case.

Card tab has private Reese raw and Jordan graded practice fixtures. Jordan uses the supplied front photograph unchanged and an 8-second gentle sway. No reverse is supplied or invented. A 16-second slow 360 turn requires both photographs. Both new motions loop; Hero reveal remains available. Speed affects duration. Inspection stays interactive and independent of the film.

Brand tab compares Spotlight, Diagonal, and Paper backgrounds, retains original studio, accepts a custom background photo, changes accent/base colors and detail, and controls the logo. Actual Columbia website wordmark is a flat 1727×910 PNG on white; no editable logo layers were recovered. See BRAND_RESEARCH.md. Imported images remain session-only; Save scene stores settings locally, and a missing restored background image falls back to Spotlight with a notice.

Spotlight is the initial brand option, not a confirmed permanent choice. All three studies remain available as useful production controls. The 3D inspection grid stays neutral; backgrounds apply in Film preview and export.
