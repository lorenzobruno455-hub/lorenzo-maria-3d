# Comic Overdrive P1 + P2 Implementation Plan

> **For agentic workers:** Execute inline using superpowers:executing-plans; the user authorized P1 and P2 together after reviewing P0.

**Goal:** Apply the approved P0 visual language to all existing exteriors and school environments, then deliver terminal update commands.

**Architecture:** Extend the existing optional renderer with a global environment profile; compile away P0 spatial masks. Reuse the sky atlas, Colorbeat material cache, selected edges and per-floor streaming. Replace campus crowns in place with fewer shared instances, preserving trunk colliders; decorate connection crowns and flower instances without changing their parent visibility.

**Tech Stack:** Existing Three.js/Vite/Playwright; no new dependencies.

**Spec:** PROJECT_AURORA_COMIC_OVERDRIVE_CODEX.md, sections P1/P2, plus the explicit user authorization this turn. P0 design/evidence: `docs/COMIC-OVERDRIVE-P0.md`.

## Global Constraints

- Preserve 0.9.1, world coordinates, doors, stairs, saves v04, seven actors, missions, six memories, controls and PWA.
- Do not implement P3/P4, merge main, or publish hosting automatically.
- Preserve the building matrix, props and loading/culling; original procedural art only.
- Small independent P1/P2 commits, focused checks, one final broader regression.

## Review Focus

- New school leases must inherit the profile on all three floors without reintroducing disposed callbacks.
- Campus foliage must continue to disappear behind school walls and frustum cull normally.
- Books, posters and narrative highlights must retain their textures, alpha, contrast and interactions.
- Low/Medium/High must keep the same palette without extra shadow lights.
- Legacy saves and Android held input must survive the physical doorway and safe checkpoint.

### Task 1: P1 exterior profile

Files: `src/systems/comic-overdrive-p0.js`, `src/systems/world.js`, `src/main.js`, `tests/unit/comic-overdrive-p1-p2.test.js`.

- [x] Add failing tests for a global profile with no mask loop, instance/skin chunks intact and restoration of borrowed material ownership.
- [x] Add profile options to the existing decorator/factory; preserve the P0 flag and add `?comic=legacy` for comparison. Default to the authorized P1/P2 presentation.
- [x] Tag existing campus crowns with their already-known centers; reuse one fill + one outline batch, keep original matrices for restoration. Existing connection foliage and flowers retain their geometries/parents and gain the shared palette.
- [x] Run focused unit and shader/browser smoke; commit P1.

### Task 2: P2 school and props

Files: same profile module, `tests/comic-overdrive-p1-p2.spec.js`, existing P0 smoke.

- [x] Test all three school floors, shared atlas/props, books and collisions against legacy mode; verify release of streamed resources.
- [x] Apply the same profile to materials of future leases, including glass and sign transparency without changing UVs. Keep selective edges, light rigs and loading strategy.
- [x] Capture representative exterior and specialist interiors; compare render metrics in identical preset/cameras. Commit P2.

### Task 3: Evidence and delivery

Files: `scripts/capture-overdrive-p1-p2.mjs`, `docs/COMIC-OVERDRIVE-P1-P2.md`, `docs/captures/comic-overdrive-p1-p2/`.

- [x] Run build, unit suite and one final browser regression; distinguish pre-existing failures from affected tests.
- [x] Record actual screenshots, costs and physical-device limitations; no Android FPS claims.
- [x] Open a stacked PR on P0 with no merge/deploy; provide safe terminal commands using fetch/switch/pull --ff-only, dependency lock and Vite host.
