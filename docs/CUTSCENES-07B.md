# CutsceneManager 07B

`src/systems/cutscene-manager.js` exports `CutsceneManager`.

```js
const cutscenes = new CutsceneManager({
  camera, actors: { lorenzo, maria, bia }, light, dialogue, effects,
  reducedMotion: () => settings.reducedMotion,
  onLock: locked => { cutsceneLocked = locked; },
  onFinish: ({ id, reason }) => {},
  onError: error => console.error(error),
});
cutscenes.play({ id: 'arrival', shots: [{
  duration: 3,
  camera: { from: [0, 3, 7], to: [2, 2, 5], lookAt: [0, 1, 0] },
  actor: { id: 'maria', state: 'wave', lookAt: [0, 1, 0] },
  light: { intensity: 1.4, color: '#ffe4bd' },
  dialogue: { speaker: 'Maria', text: 'Olá!', provenance: 'creative-fiction' },
  dialogueTimeout: 20,
}] });
```

Call `update(dt)` in seconds each frame, before rendering. Suppress gameplay camera/actor transform writers while `.active`. Combine the cutscene lock with dialogue and menu locks: a dialogue closing must not unlock controls while `.active`. The manager never changes global pause. `pause()` and `resume()` freeze/resume its timeline; the application remains responsible for routing dialogue input during pause.

`play` returns false for disposed managers or empty/invalid shot lists. Replacing an active scene first restores and finishes it. `.active` and `.paused` are booleans. `skip()` and `dispose()` are idempotent; disposal prevents future playback. `onFinish({id,reason})` runs once with `complete`, `skipped`, `error`, `disposed`, or `replaced`; `onLock(false)` runs first. Errors are reported to `onError`, followed by cleanup. Callback errors cannot prevent cleanup.

Shots accept `actor` or an `actors` command array. Commands allow `id`, `state`, `position`, and `lookAt`. Actors may be a plain object or Map and must expose `root` (Three.js Object3D). Missing actors are ignored. State commands set `cutscenePose = { state }` and call optional `requestAction(state,{duration})`. Gameplay should honor the pose while active. Original pose ownership and root position/quaternion are restored at every exit.

Camera motion interpolates position and rotation with smoothstep for the shot duration. Omitted `from` starts at the current camera position. `reducedMotion()` snaps directly to the endpoint. Camera position/quaternion and light intensity/color are restored after playback.

`duration` defaults to 2 seconds and clamps to .05–120. A dialogue object or array is passed to existing `Dialogue.start(lines,{done})`. The shot waits for duration and dialogue completion, user closing the dialogue, or `dialogueTimeout` (default max(duration,15), clamped .05–120). Timeout closes owned dialogue and advances; even broken/missing completion callbacks cannot trap controls. Shot advancement occurs at most once per update, retaining each shot's effects and dialogue even after a large frame delta.

A function-valued `effect` receives `(effects, manager)`. An object-valued `effect` is passed to optional `effects.burst(effect)`. Effects are fire-and-forget and must release their own resources. Managers restore only resources they own; avoid starting unrelated dialogue during a cutscene.

Verification: `node --test tests/unit/cutscene07b.test.js` covers interpolation, pause/resume, skip, replacement, disposal, reduced motion, missing actors, dialogue exit/timeout, effect failure, restoration, and exactly-once unlock.

## Integração no Aurora

`Adventure` compõe o bloqueio com pausa, diálogos e painéis existentes. O loop ignora FollowCamera e rotinas de NPCs durante a cena, mas atualiza as animações dos atores controlados. Pausa global por perda de foco tem prioridade de teclado sobre os controles cinematográficos e preserva a pausa local anterior. O encerramento ou pulo restaura os atores/câmera/luz, limpa entradas e devolve o objetivo. Uma falha não reinicia a mesma cena infinitamente; o jogador pode solicitá-la novamente pelo botão Retomar aventura.

A abertura e o final da primeira aventura usam posições temporárias dentro da sala existente, restauradas ao sair. Cenas da Bia e do Davi enquadram suas posições atuais. Os scripts de gameplay não precisam usar endpoints de teste para mover atores.
