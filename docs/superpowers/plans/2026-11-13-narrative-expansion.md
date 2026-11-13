# Aurora narrative expansion implementation plan

**Goal:** Four playable fictional adventures, preserving the six historical chapters and Android controls.
**Architecture:** Add one expansion controller using Story's modal lifecycle, Dialogue, Adventure's EnvironmentActions and CutsceneManager, the interaction registry, school coordinates and existing saveProgress. One reusable touch-swap puzzle handles ordering and association; a symbolic sequence variant handles tuning. No dependencies, no second audio player.
**Tech Stack:** Existing Three.js, JavaScript, Vite, DOM/CSS.
**Spec:** User's PROJECT AURORA: EXPANSÃO NARRATIVA 0.9 request, 13 November 2026.

## Audit / base

GitHub fetched on 13 November: main f05e1c0; newest reviewed art branch feat/aurora-comic-overdrive-20-d3-d4 at 50c39ef (PR #18, open). Local base a178c45 additionally contains committed radio integration 88d7e9c and two user-requested radio layout fixes, already published through Sites. Preserve all these commits. Clean tree before creating feat/aurora-narrative-expansion. Do not merge or publish this expansion.

Progress has campaign/adventure/living/schoolVisit domains in one v04 save and an untouched pre08 backup. Story owns album, inventory and modal control locking. Adventure owns the existing quest director, actions and cutscenes. SchoolNarrative maps original actors and memories into three school floors; ContinuousSchool retains continuous external travel. The radio is a single HTMLAudioElement mounted once, with 20 on-demand MP3s. Tests: Node unit tests and Playwright with system Chromium override.

## Global constraints

- Preserve historical titles, dates, source text, original final letter, all characters/minigames and saves.
- New scenes and letters explicitly fictional; no new historical assertions.
- No refactor, new dependencies, global scene redesign, main merge or automatic deployment.
- Touch controls >=44 CSS px; puzzle input uses existing Story modal lock, no extra animation loop.

## Review focus

Legacy/partial save normalization; closing and reopening puzzles; reward idempotency; cutscene interruption and movement restoration; missing MP3s and muted audio.

## M1 — Infrastructure and Plano de 14 Etapas

- [x] Add data/expansion.js: task definitions, four narrative blocks and 14 cards.
- [x] Add systems/expansion-progress.js: fresh/validate/start/advance/collect/swap/solve/finish, with validation and idempotency tests.
- [x] Add systems/narrative-expansion.js and expansion.css: registry targets, lightweight shared props, Story journal, DOM puzzle with persisted swaps/retry/hint, choices, reusable actions/scenes.
- [x] Integrate progress/main/story/achievement definitions minimally. Unit and Playwright M1 completion/resume tests; commit.

## M2 — Uma Carta Nunca Entregue

- [x] Add five distinct clue/fragment stages including visual and small logic puzzles, ordering and restored letter in album.
- [x] Test partial fragment resume, wrong answer/hint/retry and unique rewards; commit.

## M3 — A Frequência Perdida

- [ ] Add Davi interaction, three examinable components with symbolic clues, three-channel tuning puzzle and original confirmation through existing Audio.play. Read station names through existing playlist metadata, no player changes.
- [ ] Test completion with MP3 requests blocked and radio/control compatibility; commit.

## M4 — O Arquivo Aurora / final validation

- [ ] Require six historical memories (legacy saves included), collect six symbols at original points, chronological and symbol/place puzzles, lightweight page animation and replayable CutsceneManager scene.
- [ ] Test prerequisite, complete and resume all flows, malformed saves, unique rewards, controls and mobile layout; one full unit/browser regression and production build.
- [ ] Record real screenshots, renderer counters, limitations and Android test instructions. Push feature branch and open PR for review only.

M1 validation: Node expansion tests 2/2; production build passed. Browser flow reached every stage through Maria; final scene/resume/reward/control restoration passed separately. An intermediate whole-flow run was interrupted by a Vite source reload during development; final regression will rerun the uninterrupted full flow.

M2 validation: full browser flow passed, including all five fragments, visual/plant/letter puzzles, persisted swaps, scene and reload; Node tests 3/3. Corrected outbound HUD routing to the physical reception gate, via stairs when needed.
