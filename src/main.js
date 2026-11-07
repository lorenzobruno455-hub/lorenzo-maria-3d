import { InteractionRegistry } from './systems/interaction-registry.js';
import { EnvironmentValidator } from './systems/environment-validator.js';
import { LivingSchool } from './systems/living.js';
import { installPreferences } from './systems/preferences.js';
import { updateAtmosphere } from './systems/atmosphere.js';
import * as THREE from 'three';
import './style.css';
import './colorbeat.css';
import { Story } from './systems/story.js';
import { Dialogue } from './systems/dialogue.js';
import { createWorld } from './systems/world.js';
import { Character } from './systems/character.js';
import { CHARACTER_ASSETS } from './character-assets.js';
import { Controls } from './systems/controls.js';
import { FollowCamera } from './systems/camera.js';
import { Quality } from './systems/quality.js';
import { OutlineManager } from './systems/outline-manager.js';
import { VisualEffects } from './systems/visual-effects.js';
import { registerStateReader } from './systems/diagnostics.js';
import { Audio } from './systems/audio.js';
import { blocked, relativeMovement, moveWithCollisions, clamp } from './systems/physics.js';
import { loadSave, saveProgress, freshProgress, collect, objective, mariaDialogue } from './systems/progress.js';

const $ = id => document.getElementById(id);
let storage; try { storage = localStorage; } catch { storage = null; }
const saved = loadSave(storage), settings = saved.settings;
let progress = saved.progress, started = false, paused = false, dialog = false, dialogDone = null, target = null;
let living, story, dialogues, panelOpen = false, needsRender = true;
let controls, frame = 0, disposed = false, interactionTime = 0, toastTime = 0, saveTimer = 0, lastHUD = '', lastTarget = '', lastLocation = '';
const scene = new THREE.Scene(); scene.background = new THREE.Color('#cbdedc'); scene.fog = new THREE.Fog('#cbdedc', 48, 110);
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas: $('game'), antialias: true, powerPreference: 'high-performance' }); }
catch (error) { $('fatal').hidden = false; throw error; }
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, .06, 140);
scene.add(new THREE.HemisphereLight('#e7f2ff', '#7c8862', 2.2));
const sun = new THREE.DirectionalLight('#ffe5bc', 2.8); sun.position.set(-20, 35, 14); sun.shadow.bias = -.0004; sun.shadow.normalBias = .035;
Object.assign(sun.shadow.camera, { left: -39, right: 39, top: 36, bottom: -36, near: 1, far: 90 }); scene.add(sun);
const world = createWorld(scene);
const interactions=new InteractionRegistry(world,()=>progress),validator=new EnvironmentValidator(scene,world);
world.restoreDoors(progress.doors);
const lorenzo = new Character(world.resources, '#dbdbcf'), maria = new Character(world.resources, '#8faaa0');
const player = lorenzo.root; player.position.set(progress.position.x, .08, progress.position.z); maria.root.position.set(5, .08, 5); maria.root.rotation.y = -.8; scene.add(player, maria.root);
// Validate saved positions against current geometry after world and doors are restored.
if (blocked(player.position.x, player.position.z, world.solids)) player.position.set(0, .08, 19);
world.collectibles.forEach(c => c.taken = progress.collected.includes(c.id));
const follow = new FollowCamera(camera, world.occluders, progress.yaw, progress.pitch);
const quality = new Quality(renderer, sun, settings), audio = new Audio(settings);
const outlines = new OutlineManager(); outlines.attach(lorenzo); outlines.attach(maria); outlines.setQuality(settings.quality);
const visualEffects = new VisualEffects();
const active = () => started && !paused && !dialog && !panelOpen && !document.hidden;
const markerPosition = new THREE.Vector3(), effect = new THREE.Group(); scene.add(effect);
const particles = Array.from({ length: 12 }, (_, i) => {
  const m = world.resources.mesh('sphere', '#f3d38f', [.035, .035, .035]); m.userData.angle = i * Math.PI / 6; effect.add(m); return m;
});
effect.visible = false; let effectTime = 0;

function notify(message) { $('toast').textContent = message; $('toast').hidden = false; toastTime = 3; }
function save() {
  progress.position = { x: player.position.x, z: player.position.z }; progress.yaw = follow.yaw; progress.pitch = follow.pitch; progress.doors = world.doors.map(d => d.open);
  const ok = saveProgress(storage, progress, settings);
  $('save-status').textContent = ok ? 'Progresso salvo neste aparelho' : 'Salvamento indisponível neste navegador'; return ok;
}
function syncModal() {
  document.body.classList.toggle('modal', !started || paused || dialog || panelOpen);
  $('touch').inert = !active(); $('mission').inert = !active();
  document.querySelector('header').inert = !started || paused || dialog || panelOpen;
  document.querySelector('footer').inert = !started || paused || dialog || panelOpen;
  $('dialog').inert = paused || panelOpen;
  $('pause').inert = panelOpen; $('welcome').inert = panelOpen;
  if (!active()) controls?.clear();
}
function speak(speaker, text, done) {
  dialogues.start([{ speaker, text }], { instant: true, done: () => { done?.(); save(); } });
}
dialogues = new Dialogue({ root: $('dialog'), speaker: $('speaker'), speech: $('speech'), next: $('next'),
  reducedMotion: () => matchMedia('(prefers-reduced-motion:reduce)').matches,
  onLine: value => living?.dialogueLine(value),
  onState: open => { dialog = open; if (!open) { story && (story.focus = null); if (living) living.speakingId = null; } syncModal(); if (!open) save(); audio.setMood?.(open ? 'conversation' : 'exploration'); },
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const modal = panelOpen ? $('story-panel') : paused ? $('pause') : dialog ? $('dialog') : !started ? $('welcome') : null;
  if (!modal) return;
  const buttons = [...modal.querySelectorAll('button,input,select')].filter(el => !el.disabled && el.getClientRects().length);
  const first = buttons[0], last = buttons.at(-1);
  if (e.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) { e.preventDefault(); last?.focus(); }
  else if (!e.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) { e.preventDefault(); first?.focus(); }
});
function nearestTarget() {
 const pos=player.position;interactions.entries.clear();
 const add=(o,kind,distance,extra={})=>interactions.register({id:`${kind}:${o.id}`,object:{...o,kind,original:o},distance,height:o.height??(o.mesh?new THREE.Box3().setFromObject(o.mesh).max.y+.04:1.4),priority:kind==='seat'?-1.2:['item','memory','game','album','memory-book'].includes(kind)?.5:0,...extra,action:t=>handleInteraction({...t,ref:o})});
 living?.targets().forEach(o=>add(o,o.kind,o.kind==='maria'?2.5:2.4));
 world.doors.forEach(o=>add(o,'door',3.1,{height:1.4,ignoreCollider:o.bounds}));
 if(progress.stage===1&&!living?.free)world.collectibles.filter(o=>!o.taken).forEach(o=>add(o,'item',2));
 world.points.forEach(o=>add(o,'point',2.4,{height:1.5}));
 story?.world.objects.filter(o=>(!o.mesh||o.mesh.visible)&&(o.kind!=='memory'||progress.stage===2)).forEach(o=>add(o,o.kind,o.kind==='memory-book'?2.1:2.3,{height:o.height,ignoreCollider:o.ignoreCollider}));
 const t=interactions.nearest(pos);return t?{...t,ref:t.original}:null;
}
function handleInteraction(target) {

  if (!target) return;
  audio.unlock();
  if (['npc', 'campus'].includes(target.kind)) { living.interaction(target); return; }
  if (['album', 'game', 'memory', 'secret','memory-book','narrative','seat'].includes(target.kind)) { story.interact(target); return; }
  if (target.kind === 'maria') {
    living.speakingId = 'maria';
    if (living.free || progress.stage === 2 || (progress.stage === 1 && progress.collected.length < 3)) { story.maria(); return; }
    const line = mariaDialogue(progress); speak('MARIA', line.text, () => { progress.stage = line.nextStage; updateHUD(); });
  } else if (target.kind === 'door') {
    if (world.toggleDoor(target.ref, player.position)) { interactionTime = .65; audio.play('door'); save(); }
    else notify('Dê um passo para trás para movimentar a porta.');
  } else if (target.kind === 'point') speak(target.name.toUpperCase(), target.text);
  else if (collect(progress, target.id)) {
    const c = target.ref; c.taken = true; interactionTime = .6; effect.position.set(c.x, 1, c.z); effectTime = .8; effect.visible = true;
    audio.play('collect'); notify(`${c.name} encontrado!`); visualEffects.burst('DESCOBERTA!'); updateHUD(); save();
  }
}
function interact(){if(!active())return;const t=nearestTarget();if(t)interactions.activate(t.interactionId,player.position);}
controls = new Controls({ canvas: $('game'), joystick: $('joystick'), stick: $('stick'), run: $('run'), interact: $('interact'), active, onInteract: interact, onPause: () => { if (panelOpen) story.close(); else if (dialog) dialogues.close(); else setPause(!paused); }, sensitivity: () => settings.sensitivity });
$('prompt').onclick = interact;
function setPause(value) {
  if (!started) return;
  paused = value; $('pause').hidden = !paused; $('reset-confirm').hidden = true;
  if (paused) { save(); syncSettings(); $('resume').focus(); }
  else { $('resume').blur(); if (dialog) $('next').focus(); }
  syncModal();
}
$('pause-button').onclick = () => setPause(!paused); $('resume').onclick = () => setPause(false);
$('start').textContent = saved.exists ? 'Continuar a explorar →' : 'Começar a explorar →';
$('start').onclick = () => { started = true; $('welcome').hidden = true; $('start').blur(); audio.unlock(); syncModal(); save(); };
living = new LivingSchool({ scene, world, maria, player, getProgress: () => progress, settings, dialogue: dialogues, save, notify, audio });
if (blocked(player.position.x, player.position.z, world.solids)) player.position.set(0, .08, 19);
installPreferences(settings, save, controls);
story = new Story({ player, living, scene, world, getProgress: () => progress, save, notify, dialogue: dialogues, audio,
  start: () => { if (!started) $('start').click(); if (paused) setPause(false); },
  tutorial: () => { living.setMode('campaign'); const line = mariaDialogue(progress); speak('MARIA', line.text, () => { progress.stage = line.nextStage; updateHUD(); }); },
  onPanel: open => { panelOpen = open; if (open) { dialogues.close(); if (paused) setPause(false); } syncModal(); needsRender = true; },
});
if(blocked(player.position.x,player.position.z,world.solids))player.position.set(0,world.groundHeight(0,19),19);
$('help').onclick = () => speak('COMO JOGAR', 'Use WASD ou o joystick para andar. Arraste o mouse ou o lado direito da tela para olhar ao redor. Segure Shift ou Correr para correr. Aproxime-se de Maria, portas, placas ou lembranças e pressione E ou Interagir. As portas da sala e da biblioteca podem ser abertas. Use Esc ou ☰ para pausar.');
function syncSettings() {
  $('quality').value = settings.quality; $('sensitivity').value = settings.sensitivity; $('volume').value = settings.volume;
  $('audio-enabled').checked = settings.sound; $('shadows').checked = settings.shadows; $('adaptive').checked = settings.adaptive;
  $('sound').textContent = `Som: ${settings.sound ? 'ligado' : 'desligado'}`;
}
$('sound').onclick = () => { audio.unlock(); settings.sound = !settings.sound; syncSettings(); save(); };
for (const id of ['quality', 'sensitivity', 'volume', 'audio-enabled', 'shadows', 'adaptive']) $(id).addEventListener('input', () => {
  settings.quality = $('quality').value; settings.sensitivity = Number($('sensitivity').value); settings.volume = Number($('volume').value);
  settings.sound = $('audio-enabled').checked; settings.shadows = $('shadows').checked; settings.adaptive = $('adaptive').checked;
  audio.unlock(); if (id === 'quality' || id === 'shadows') { quality.apply(); outlines.setQuality(settings.quality); } syncSettings(); save();
});
$('restart').onclick = () => { $('reset-confirm').hidden = false; $('confirm-reset').focus(); };
$('cancel-reset').onclick = () => { $('reset-confirm').hidden = true; $('restart').focus(); };
$('confirm-reset').onclick = () => {
  dialogues.close(); const campaign = progress.campaign; progress = freshProgress(); progress.campaign = campaign; player.position.set(0, .08, 19); player.rotation.y = 0; follow.yaw = 0; follow.pitch = .38;
  world.restoreDoors(progress.doors); world.collectibles.forEach(c => c.taken = false); dialog = false; dialogDone = null; $('dialog').hidden = true;
  interactionTime = effectTime = 0; effect.visible = false; updateHUD(); save(); setPause(false); follow.update(player.position, 0, true);
};
function updateHUD() {
  const key = `${progress.living.mode}:${JSON.stringify(progress.living.events)}:${progress.stage}:${progress.collected.join(',')}:${progress.campaign.memories.join(',')}:${JSON.stringify(progress.campaign.steps)}`; if (key === lastHUD) return; lastHUD = key;
  $('objective').textContent = (living?.free || living?.goal() || progress.stage === 2) && story ? story.objective() : objective(progress); $('progress').style.width = `${progress.collected.length / 3 * 100}%`;
  $('count').textContent = progress.stage === 2 ? `${progress.campaign.memories.length} de 6 memórias · prólogo concluído` : `${progress.collected.length} de 3 lembranças`;
  const total = progress.stage === 2 ? 6 : 3, amount = progress.stage === 2 ? progress.campaign.memories.length : progress.collected.length;
  $('progress').style.width = `${amount / total * 100}%`;
  document.querySelector('[role=progressbar]').setAttribute('aria-valuenow', amount);
  document.querySelector('[role=progressbar]').setAttribute('aria-valuemax', total);
  $('mission').querySelector('.eyebrow').textContent = living?.free ? 'COLÉGIO AURORA · EXPLORAÇÃO LIVRE' : progress.stage === 2 ? `MEMÓRIAS · CAPÍTULO ${Math.min(6, progress.campaign.memories.length + 1)}/6` : 'CAPÍTULO 01 / PRIMEIRO SINAL';
}
function nextObjective() {
  if (story?.goal()) return story.goal();
  if (living?.free) return null;
  if (progress.stage !== 1 || progress.collected.length === 3) return { ...living.mariaPosition, name: 'MARIA' };
  return world.collectibles.filter(c => !c.taken).sort((a, b) => Math.hypot(a.x - player.position.x, a.z - player.position.z) - Math.hypot(b.x - player.position.x, b.z - player.position.z))[0];
}
function updateMarker() {
  const next = nextObjective(); $('objective-marker').hidden = !next || progress.stage === 2 && !story?.goal();
  if (!next) return;
  markerPosition.set(next.x, 2.7, next.z).project(camera);
  const behind = markerPosition.z > 1, x = clamp((markerPosition.x * .5 + .5) * innerWidth, 25, innerWidth - 95), y = clamp((-markerPosition.y * .5 + .5) * innerHeight, 65, innerHeight - 170);
  const label = story?.goal() ? next.name : next.name === 'MARIA' ? 'MARIA' : next.id === 'notebook' ? 'SALA 01' : next.id === 'card' ? 'BIBLIOTECA' : 'JARDIM';
  $('objective-marker').querySelector('small').textContent = `${behind ? '↻ ' : ''}${label} · ${Math.round(Math.hypot(next.x - player.position.x, next.z - player.position.z))} m`;
  const markerWidth = $('objective-marker').offsetWidth;
  $('objective-marker').style.transform = `translate(${clamp(behind ? innerWidth - markerWidth - 12 : x, 12, innerWidth - markerWidth - 12)}px,${behind ? 75 : y}px)`;
}
function updateTarget() {
  target = active() ? nearestTarget() : null;
  const key = target ? `${target.kind}:${target.id}:${target.ref.open}` : '';
  if (key !== lastTarget) {
    const label = !target ? 'Interagir' : target.kind === 'door' ? `${target.ref.open ? 'Fechar' : 'Abrir'} porta` : target.kind === 'npc' ? `Conversar com ${target.name}` : target.kind === 'campus' ? target.name : target.kind === 'maria' ? 'Conversar com Maria' : target.kind === 'memory-book' ? `Ler ${target.name}` : target.kind === 'memory' ? `Descobrir ${target.name}` : target.kind === 'game' ? `Jogar ${target.name}` : target.kind === 'album' ? 'Abrir álbum' : target.kind === 'item' ? `Recolher ${target.name}` : `Ler ${target.name}`;
    $('prompt').textContent = `E · ${label}`; $('interact').textContent = target?.kind === 'door' ? (target.ref.open ? 'Fechar' : 'Abrir') : target?.kind === 'maria' ? 'Conversar' : target?.kind === 'item' ? 'Recolher' : 'Interagir';
    $('interact').disabled = !target; lastTarget = key;
  }
  story?.world.highlight(target);
  $('prompt').hidden = !target;
}
function resize() { controls.clear(); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); quality.resize(); }
addEventListener('resize', resize);
addEventListener('pagehide', save);
addEventListener('blur', () => { if (started && !paused) setPause(true); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { save(); controls.clear(); if (started) setPause(true); cancelAnimationFrame(frame); frame = 0; }
  else if (!frame && !disposed) { last = performance.now(); frame = requestAnimationFrame(animate); }
});
for (const [name, character] of [['lorenzo', lorenzo], ['maria', maria]]) {
  const asset = CHARACTER_ASSETS[name];
  if (asset.url) character.loadGLB(asset.url, asset.clips).catch(error => { console.warn(`Modelo ${name}:`, error.message); notify('Modelo externo indisponível; personagem provisório mantido.'); });
}
let last = performance.now(), time = 0, hudTimer = 0;
function animate(now) {
  if (disposed || document.hidden) { frame = 0; return; }
  frame = requestAnimationFrame(animate); const rawDT = Math.max(.001, (now - last) / 1000), dt = Math.min(rawDT, .1); last = now;
  let speed = 0;
  if (active()) {
    time += dt; const input = controls.sample(dt); follow.rotate(input.lookX, input.lookY);
    if(story?.seat&&(Math.hypot(input.x,input.z)>.05)){player.position.set(story.seat.exit.x,world.groundHeight(story.seat.exit.x,story.seat.exit.z),story.seat.exit.z);story.seat=null;}
    const delta = relativeMovement(input.x, input.z, follow.yaw, input.running ? 6 : 3.5, dt);
    const distance = moveWithCollisions(player.position, delta, world.solids); speed = distance / dt;
    if (speed > .01) {
      const rotation = Math.atan2(delta.x, delta.z), angle = Math.atan2(Math.sin(rotation - player.rotation.y), Math.cos(rotation - player.rotation.y));
      player.rotation.y += angle * (1 - Math.exp(-dt * 14));
    }
    interactionTime = Math.max(0, interactionTime - dt); saveTimer += dt; if (saveTimer > 1) { save(); saveTimer = 0; }
  }
  dialogues.update(dt);
  story?.update(paused || document.hidden ? 0 : dt, player.position, active());
  if (!paused && started) {
    living.update(panelOpen ? 0 : dt, { player: player.position, active: active(), dialogueOpen: dialog, speaker: $('speaker').textContent, playerSpeed: speed });
    if (dialog && living.partner) { const p = living.partner.agent.position; const angle = Math.atan2(p.x - player.position.x, p.z - player.position.z); player.rotation.y += Math.atan2(Math.sin(angle - player.rotation.y), Math.cos(angle - player.rotation.y)) * (1 - Math.exp(-dt * 8)); }
    player.position.y=story?.seat?story.seat.height:world.groundHeight(player.position.x,player.position.z);
    lorenzo.update(dt, speed, dialog && $('speaker').textContent === 'LORENZO', interactionTime > 0,story?.seat?{state:'sit'}:{});

    world.quality=settings.quality;world.update(dt, time, player.position);
    if (effectTime > 0) { effectTime -= dt; particles.forEach((m, i) => { const t = .8 - effectTime; m.position.set(Math.cos(m.userData.angle) * t, t * (1.5 + i % 3 * .2), Math.sin(m.userData.angle) * t); m.scale.setScalar(.035 * Math.max(0, effectTime / .8)); }); if (effectTime <= 0) effect.visible = false; }
  }
  if (toastTime > 0) { toastTime -= dt; if (toastTime <= 0) $('toast').hidden = true; }
  updateAtmosphere(renderer, follow, player.position, settings.quality, dt, world);
  player.visible=!(dialog&&story?.focus?.hidePlayer);document.body.classList.toggle('reading-memory',!player.visible);
  follow.partner = living.partner?.agent.position;
  follow.focusObject = dialog ? story?.focus : null; follow.conversation = dialog && !story?.focus;
  follow.update(player.position, active() || dialog ? dt : 0); camera.updateMatrixWorld();
  hudTimer += dt; if (hudTimer > .08) {
    updateHUD(); updateTarget(); updateMarker();
    const zone = player.position.z < -18 && Math.abs(player.position.x) < 6 ? 'CANTINA' : player.position.x < -28 && player.position.z < 10 ? 'QUADRA' : player.position.x > 28 && player.position.z < -6 ? 'SALA DE MÚSICA' : player.position.z < -6 && Math.abs(player.position.x) > 6 ? (player.position.x < 0 ? 'SALA DE LITERATURA' : 'BIBLIOTECA') : player.position.z > 17 ? 'JARDIM DA ESCOLA' : 'PÁTIO CENTRAL';
    if (lastLocation !== zone) { $('location').firstChild.textContent = `${zone} `; lastLocation = zone; } hudTimer = 0;
  }
  // Frozen pause/welcome scenes need only redraw on resize, settings or camera settling.
  if (active() || dialog || (panelOpen && started && story?.game) || needsRender) { renderer.render(scene, camera); needsRender = false; }
  audio.update?.(); if (active()) quality.sample(rawDT);
}

addEventListener('resize', () => needsRender = true);
$('pause').addEventListener('input', () => needsRender = true);
world.update(0, 0, player.position); follow.update(player.position, 0, true); updateHUD(); syncSettings(); syncModal(); frame = requestAnimationFrame(animate);

// Read-only diagnostic API; no production teleport or mission mutation hooks.
export function getGameState() {
  return { x: player.position.x, z: player.position.z, stage: progress.stage, collected: progress.collected.length, items: [...progress.collected], started, paused, dialog,
    yaw: follow.yaw, pitch: follow.pitch, analog: { ...controls.analog }, running: controls.runPointers.size > 0 || controls.keys.has('shift'), animation: lorenzo.state,
    camera: { x: camera.position.x, y: camera.position.y, z: camera.position.z, distance: follow.actualDistance }, doors: world.doors.map(d => ({ open: d.open, angle: d.angle })),
    living: structuredClone(progress.living), npcs: living.actors.map(a => ({ id: a.definition.id, x: a.agent.position.x, z: a.agent.position.z, state: a.agent.state, distance: a.agent.distanceWalked, transitions: a.agent.transitions })),
    campaign: structuredClone(progress.campaign), storyPage: story?.page, rhythm: story?.game?.phase,
    spatial:validator.inspect(world.placed), memoryBooks:story.world.books.map(b=>({id:b.id,x:b.x,z:b.z,unlocked:b.unlocked,angle:b.mesh.userData.cover.rotation.z})),
    quality: settings.quality, resolutionScale: quality.scale, outlines: outlines.shells.filter(s=>s.visible).length, fps: Math.round(quality.fps), drawCalls: renderer.info.render.calls, geometries: renderer.info.memory.geometries };
}
registerStateReader(getGameState);
if(new URLSearchParams(location.search).has('debug')){addEventListener('keydown',e=>{if(e.code==='F3'){e.preventDefault();if(validator.visible)validator.clear();else validator.show([...world.placed,...story.world.placed],[player,...living.actors.map(a=>a.character.root)]);needsRender=true;}});}

export function dispose() {
  validator.dispose();interactions.dispose(); visualEffects.dispose(); outlines.dispose();
  disposed = true; cancelAnimationFrame(frame); controls.clear(); save(); story?.dispose(); living?.dispose(); dialogues?.dispose(); lorenzo.dispose(); maria.dispose(); world.dispose(); audio.dispose(); renderer.dispose();
}
if (import.meta.hot) import.meta.hot.dispose(dispose);
