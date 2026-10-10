# Pull Studio agent instructions

These rules apply to this Columbia Card Studio repository (original M5 checkout: `/Users/m5/Workspaces/apps/prototypes/pull-studio`). Read `APP_SPEC.md`, `DESIGN.md`, and `README.md` before changing the app. Keep the prototype local-first and preserve the revised Card / Brand / Scene / Export inspector and 3D inspect / Film preview split.

## Renderer contract

- Keep `src/model.ts` and `src/studio.ts` as the shared source of truth for motion. Preview and export must sample the same timestamp-driven scene; do not add wall-clock animation, hidden mutable timelines, or random effects that make frame output differ from preview.
- Export frames with explicit timestamps and durations. Keep the 1080 × 1920 target, H.264 codec probe, selected 24/30 fps, and 12/18 Mbps options deterministic. Do not add a server, cloud renderer, account, telemetry, or a silent format fallback.
- Preserve uploaded photographs. Crop with uniform scaling only; Fit contains the source, Fill/zoom crops it, and pan/rotation remain user-controlled. Do not generate, retouch, reinterpret, or invent card artwork. Keep the optional reverse and neutral unprinted fallback behavior intact.
- A shop logo, title, subtitle, and shop name are output composition. 3D inspect uses its own orbit camera and hides signature text, while Film preview must remain the exact 9:16 composition used by export.
- Do not copy code or artwork from the unlicensed BrannySG/card-renderer candidate. Check `RESEARCH.md` and `THIRD_PARTY_NOTICES.md` before adding dependencies or upstream material.

## Scope and workflow

- This is a bounded prototype, not a card generator, grading system, collection backend, or production service. Do not add generators for card artwork, automatic corner/perspective extraction, accounts, uploads, cloud sync, audio, or a multitrack editor without a new brief.
- Work in this project only. Do not spawn nested delegation for Pull Studio work.
- Prefer the existing npm scripts and installed package versions. Run the closest focused tests and `npm run typecheck`; run `npm run preflight` before a handoff when source behavior changes.
- Record actual browser/export evidence in `VERIFY.md` when that file exists. Keep README claims concise and avoid duplicating dated verification logs.
- Preserve existing local UI decisions and current source artwork behavior while fixing or extending implementation. If a requested change would alter the revised inspector or preview modes, call out the drift before editing.

- Sports profile must retain zero corner radius and no bevel. Rounded TCG/custom and full-holder graded profiles are user-requested alternatives; keep all geometry shared by preview and export. Graded depth is illustrative, not a measured PSA/SGC/BGS model. Never invent a reverse photograph or certificate.
