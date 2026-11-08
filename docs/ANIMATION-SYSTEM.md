# Aurora 0.7B animation

Both checked-in GLBs contain an original 18-bone skinned rig and 16 sampled clips: Idle, Walk, Run, Accelerate, Decelerate, Turn, Sit, Stand, Wave, Talk, Point, Pickup, OpenBook, React, Interact and Observe. Regenerate with `blender -b --python scripts/blender/build_aurora.py`. No external downloads, accounts or paid services are required.

`Character.update(dt, speed = 0, talking = false, interacting = false, pose = {})` remains compatible. Loading attaches one `AnimationController`, exposing its `mixer`, `actions`, `state` and `diagnostics`. Clips crossfade over .22 seconds. Motion starts/stops use .28-second Accelerate/Decelerate transitions; Walk and Run playback rates follow speed relative to 2.2 and 5.5 metres/second. Clips are in place: movement/collision remain owned by the world. The procedural model still works before loading and after a loading failure.

`character.requestAction(name, {duration} = {})` returns a boolean and accepts case-insensitive clip names (spaces/hyphens/underscores are ignored). The request temporarily overrides locomotion, then returns to the current movement/talking state. Duration defaults to the clip duration; explicit duration uses seconds. A later request replaces the earlier one. One-shot actions clamp at their final frame until their requested duration ends.

`character.cutscenePose = {state: 'talk', heading: 1.2}` overrides the update pose while present. Set it to `null` to release cutscene control. Heading is a world-facing yaw in radians with damped orientation. Explicit pose state takes precedence over requested actions.

Sit is an authored stable pose with knees forward and foot bones near ground. To align the hip contact to furniture, supply `{state:'sit', seatHeight: worldSurfaceY}` or `{state:'sit', seatAnchor:{y:worldSurfaceY}}`. This accounts for an actor root already raised to the seat surface. Omit seat information for the existing floor-relative NPC sit. The authored hip contact height is .44m and is approximate across differently scaled avatars. Stand animates from sitting to upright. Pickup and OpenBook animate the body and hands; a held book/prop must be attached by the interaction system.

Limitations: clips are original stylized rigid-weight animation, without runtime terrain IK or retargeting. Feet are authored for a flat floor; uneven terrain requires separate grounding. The fallback gestures approximate the authored rig and do not provide the full clip fidelity.

Validation: `node --test tests/unit/animation07b.test.js tests/unit/aurora-assets.test.js tests/unit/character-camera.test.js tests/unit/aurora-lifecycle.test.js`. Tests exercise a real Three AnimationMixer, speed scaling and bounded transitions; GLB tests verify all clips, skeletons, independent skin clones, raised wave hands and forward bent seated knees with grounded foot bones. Logs are under `work/aurora07b/`.
