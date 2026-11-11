# Comic Overdrive P3 + P4 Implementation Plan

> **For agentic workers:** Execute inline with superpowers:executing-plans. P3/P4 were explicitly authorized together after P1/P2.

**Goal:** Finish the comic character/UI presentation and polish spatial/aliasing exceptions, with evidence and one final regression.

**Architecture:** Extend the existing Colorbeat cache with opt-in skin/hair/eye roles from original GLB material names. Keep shared geometry, rigs, ink groups and quality budgets. Add one scoped CSS layer over existing UI/cinematics/VFX and filter distant hatching in the existing shader. Preserve older renderer modes for reproducible comparisons.

**Tech Stack:** Existing Three.js, Vite, Playwright; no new dependencies.

**Spec:** PROJECT_AURORA_COMIC_OVERDRIVE_CODEX.md sections 7–14; `docs/COMIC-OVERDRIVE-P1-P2.md`.

## Global Constraints
- Base `5379b7646ec26b35bf06932fb3ea154e782eb891` / PR #14; branch `feat/aurora-comic-overdrive-p3-p4`.
- Preserve 0.9.1 world, coordinates, colliders, camera/control code, GLB files/rigs/clips, six memories, dates, saves v04, PWA.
- No merge, hosting deployment, dependency install, new engine or raised rendering budgets.
- Physical Android/Chromebook performance cannot be certified without a connected device; document the manual check separately.

## Review Focus
- Authored skin/eye colors must survive and stay separate from wood/plaster; no per-actor geometry duplication.
- Ink remains screen-relative, skinned and limited at distance; facial groups stay excluded.
- All panels remain readable/touchable in 844×390 and 390×844; reduced motion and high contrast survive.
- Distant hatching fades before aliasing; Low keeps the same palette with fewer decorative marks.
- Old long regression timeouts must be investigated without modifying game speed, assertions or timeout budgets.

### Task 1 — P3 characters and interface
- [ ] Capture P1/P2 baseline of character, hall, mobile menu/dialogue/settings/album/cinematic.
- [ ] Add failing role/ownership tests; implement opt-in `skin`, `hair`, `eye` profiles through existing GLB material conversion and shared cache.
- [ ] Add scoped original comic panels/state accents/cinematic framing/VFX styling; preserve text, layout, safe areas and hit targets.
- [ ] Add browser shader/contrast/mobile/cinematic smoke and compare real images; commit P3.

### Task 2 — P4 polish and automation
- [ ] Filter hatching using world-space derivatives, reduce distant strokes and disable decorative hatching on Low; retain selected actor ink limits and no facial ink.
- [ ] Test efficient large camera drags in the regression helper using normal pointer capture; change only automation if proven, without game hooks or larger timeouts.
- [ ] Measure draw calls/triangles/resources at comparable views; verify visibility, save/control and resource ownership checks.
- [ ] Run unit/build/focused checks while editing; one full browser regression after stabilization, followed only by necessary targeted reruns.

### Task 3 — Delivery
- [ ] Inventory all visual categories, record actual before/after images, measurements, limitations and device checklist.
- [ ] Review new diff; open stacked PR on P1/P2, no merge/publication. Provide Chromebook-compatible terminal commands.
