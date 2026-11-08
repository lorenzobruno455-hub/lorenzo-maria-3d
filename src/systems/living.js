import { Character } from './character.js';
import { RoutineAgent } from './npcs.js';
import { NPC_DATA, EVENT_DATA, FRIEND_ACTIVITIES, solveFriendActivity, befriend, rememberLine } from './social.js';
import { eventAction, eventObjective } from './events.js';
import { createCampusWorld } from './campus-world.js';
import { nextStep } from './quests.js';
import { blocked } from './physics.js';
const line = (speaker, text) => ({ speaker, text, provenance: 'school-fiction' });
const element = (tag, text) => { const e = document.createElement(tag); e.textContent = text; return e; };
export class LivingSchool {
  constructor({ scene, world, maria, player, getProgress, settings, dialogue, save, notify, audio }) {
    Object.assign(this, { world, maria, player, getProgress, settings, dialogue, save, notify, audio });
    this.campus = createCampusWorld(scene, world); this.speakingId = null; this.time = 0; this.greeting = 0; this.lastStepSound = 0;
    const mariaData = { id: 'maria', name: 'Maria', start: { x: 5, z: 5 }, route: [{ x: 7, z: 0, state: 'talk', duration: 6 }, { x: 20, z: -14, state: 'sit', duration: 11 }, { x: 5, z: 5, state: 'observe', duration: 7 }, { x: -20, z: -15, state: 'observe', duration: 8 }] };
    this.actors = [{ definition: mariaData, agent: new RoutineAgent(mariaData), character: maria }, ...NPC_DATA.map(definition => ({ definition, agent: new RoutineAgent(definition), character: new Character(world.resources, definition.color, { simple: true }) }))];
    this.agents = this.actors.map(a => a.agent); this.actors.forEach((a, i) => a.agent.replan = i * .18);
    this.actors.forEach(actor => { if (actor.character !== maria) scene.add(actor.character.root); });
    this.syncOccupants();
  }
  get state() { return this.getProgress().living; }
  get mariaPosition() { return this.actors[0].agent.position; }
  get partner() { return this.actors.find(a => a.definition.id === this.speakingId); }
  get free() { return this.state.mode === 'free'; }
  syncOccupants() { this.world.occupants = this.actors.map(a => a.agent.position); }
  setMode(mode) { this.state.mode = mode === 'free' ? 'free' : 'campaign'; this.save(); this.notify(this.free ? 'Exploração livre · seu progresso da campanha foi preservado.' : 'Campanha retomada.'); }
  dialogueLine(value) { rememberLine(this.state, value); if (value.source === 'LL' || value.source === 'MM') this.speakingId = 'maria'; }
  targets() {
    return [ ...this.actors.map(a => ({ id: a.definition.id, name: a.definition.name, kind: a.definition.id === 'maria' ? 'maria' : 'npc', ...a.agent.position })),
      ...this.campus.objects.filter(o => o.mesh.visible) ];
  }
  say(id, lines, options = {}) { this.speakingId = id; this.dialogue.start(lines, options); }
  changed(message = '') { this.save(); if (message) this.notify(message); }
  update(dt, { player, active, dialogueOpen, speaker, playerSpeed = 0 }) {
    this.time += dt; this.state.actorClock = (this.state.actorClock + dt) % 86400;
    this.campus.update(dt, this.time, this.state, this.settings.quality);
    const required = !this.free && (this.getProgress().stage < 2 || nextStep(this.getProgress().campaign)?.type === 'talk');
    for (const actor of this.actors) {
      const { agent, definition, character } = actor, id = definition.id;
      const relevantEvent = EVENT_DATA.find(e => e.npc === id && this.state.events[e.id] && this.state.events[e.id] !== 'done');
      const obstacles = this.world.solids.filter(b => b.seatFor !== id);
      const planningObstacles = obstacles.filter(b => !this.world.doors.some(d => d.bounds === b && d.angle < 1));
      // NPCs open the same physical doors as the player; no wall/door teleporting.
      const target = agent.definition.route[agent.index];
      for (const door of this.world.doors) if (Math.hypot(agent.position.x - door.x, agent.position.z + 6) < 3 && ((agent.position.z < -6) !== (target.z < -6))) door.open = true;
      if (dt > 0) agent.update(dt, { obstacles, planningObstacles, player, others: this.agents, speaking: dialogueOpen && this.speakingId === id, hold: !!relevantEvent && this.speakingId !== id,
        forcedGoal: id === 'maria' && required ? { x: 5, z: 5 } : null });
      character.root.position.set(agent.position.x, this.world.groundHeight(agent.position.x,agent.position.z), agent.position.z); character.root.rotation.y = agent.rotation;
      let pose = agent.state;
      if (dialogueOpen && this.speakingId === id) pose = speaker === definition.name.toUpperCase() ? 'talk' : 'observe';
      if (pose === 'talk' && !(dialogueOpen && this.speakingId === id)) {
        const friend = this.actors.find(a => a !== actor && Math.hypot(a.agent.position.x - agent.position.x, a.agent.position.z - agent.position.z) < 3);
        if (friend) agent.face(friend.agent.position, dt); else pose = 'observe';
      }
      if (actor.reaction > 0) { actor.reaction -= dt; pose = 'react'; }
      character.update(dt, agent.speed, pose === 'talk', false, { state: pose });
      if (id !== 'maria') {
        const distance = Math.hypot(agent.position.x - player.x, agent.position.z - player.z);
        const rank = this.actors.slice(1).filter(a => Math.hypot(a.agent.position.x - player.x, a.agent.position.z - player.z) < distance).length;
        character.root.visible = distance < (this.settings.quality === 'low' ? 20 : 45) && (this.settings.quality !== 'low' || rank < 2);
        character.root.traverse(m => { if (m.isMesh) m.castShadow = this.settings.quality === 'high' && distance < 15; });
      }
    }
    // A brief, non-blocking invitation uses an original creative Maria line.
    this.greeting -= dt;
    if (active && !required && this.greeting <= 0 && Math.hypot(player.x - this.mariaPosition.x, player.z - this.mariaPosition.z) < 3) {
      this.greeting = 55; this.notify('Maria acena: há uma conversa esperando por você.');
    }
    if (active && playerSpeed > .15) { this.lastStepSound += dt * playerSpeed; if (this.lastStepSound > 1.4) { this.lastStepSound = 0; this.audio.play('step'); } }
  }
  interaction(target) {
    if (target.kind === 'npc') return this.npc(target.id);
    if (target.id === 'canteen') return this.canteen();
    if (target.id === 'ball') { this.campus.kick(this.player.position); this.actors.forEach(a => { if (Math.hypot(a.agent.position.x - target.x, a.agent.position.z - target.z) < 5) a.reaction = .9; }); this.audio.play('ball'); this.notify('Bola em jogo! Caio aprova a iniciativa.'); return; }
    if (target.id === 'note') { this.say(null, [line('BILHETE FICTÍCIO', 'Se encontrar minha concentração, favor devolver antes da prova. Assinado: alguém que veio só buscar um lápis.')]); return; }
    if (target.id === 'lost-book') {
      this.say(null, [line('BIBLIOTECA', 'O livro está identificado com o nome de Bia. Entre as páginas, um marcador pede: “Não dobre a ponta, ela também tem sentimentos.”')], { done: () => { eventAction(this.state, target.id, 'find'); this.changed('Livro encontrado · devolva-o a Bia.'); } }); return;
    }
    if (target.id === 'familiar-music') {
      this.audio.setMood('memory');
      this.say(null, [line('PARTITURA', 'Uma pequena melodia original do jogo. Davi marcou as pausas do ensaio nesta folha.'), { speaker: 'NARRADOR', text: 'A trilha sonora muda. O protagonista reconhece os primeiros acordes de uma música favorita e começa a associá-los a Maria.', provenance: 'creative-fiction' }], { done: () => { eventAction(this.state, target.id, 'find'); this.changed('Partitura ouvida · converse com Davi.'); } });
    }
  }
  npc(id) {
    const npc = NPC_DATA.find(n => n.id === id); if (!npc) return;
    const event = EVENT_DATA.find(e => e.npc === id), state = event && this.state.events[event.id];
    const choices = [ { label: 'Como está o dia?', action: () => this.say(id, [line(npc.name.toUpperCase(), npc.lines[1])], { done: () => { befriend(this.state, id, `conversation:${id}`); this.changed('Conversa registrada.'); } }) } ];
    if(this.adventure&&['bia','davi'].includes(id))choices.push({label:`Aventura: ${id==='bia'?'O Livro Perdido':'Uma Música Conhecida'}`,action:()=>this.adventure.start(id==='bia'?'lost-book':'familiar-music')});
    if (event) {
      if (!state) choices.push({ label: `Ajudar: ${event.title}`, action: () => this.beginEvent(event) });
      else if (state === 'found') choices.push({ label: event.id === 'lost-book' ? 'Devolver o livro' : 'Compartilhar a partitura', action: () => this.finishEvent(event) });
      else if (state === 'answered' && event.id === 'physics-question') choices.push({ label: 'Ouvir a explicação', action: () => this.explainPhysics(this.state.decisions['physics-question']) });
      else if (state === 'active' && event.id === 'physics-question') choices.push({ label: 'Responder ao enigma', action: () => this.physicsQuestion() });
      else if (state === 'active') choices.push({ label: 'Lembrar o objetivo', action: () => this.say(id, [line(npc.name.toUpperCase(), event.description)]) });
      else if (state === 'done' && this.free) choices.push({ label: 'Repetir este encontro', action: () => { this.state.events[event.id] = 'active'; this.beginEvent(event); } });
    }
    if ((this.state.reputation[id] || 0) >= 2) choices.push({ label: 'Conversa de amizade', action: () => this.friendConversation(npc) });
    if (id === 'lia') choices.push({ label: 'Ver cardápio', action: () => this.canteen() });
    this.say(id, [line(npc.name.toUpperCase(), npc.lines[0])], { choices });
  }
  beginEvent(event) {
    eventAction(this.state, event.id, 'start'); this.save();
    if (event.id === 'physics-question') return this.physicsQuestion();
    this.say(event.npc, [line(event.npc === 'bia' ? 'BIA' : 'DAVI', event.id === 'lost-book' ? 'Perdi meu livro na biblioteca. Você pode procurar perto das estantes e trazer de volta? Quero terminar a leitura antes do recreio.' : 'Esqueci a partitura no pavilhão de música. Ouça a melodia e depois me conte o que chamou sua atenção.')]);
  }
  physicsQuestion() {
    this.say('helena', [line('PROF. HELENA', 'Duas bolas de massas diferentes são soltas da mesma altura. Desprezando a resistência do ar, qual chega primeiro ao chão?')], { choices: [
      { label: 'Chegam juntas', action: () => this.physicsAnswer('together') }, { label: 'A mais pesada', action: () => this.physicsAnswer('heavy') },
    ] });
  }
  physicsAnswer(choice) {
    if (!eventAction(this.state, 'physics-question', 'answer', choice)) return;
    this.save(); this.explainPhysics(choice);
  }
  explainPhysics(choice) {
    this.say('helena', [line('PROF. HELENA', `${choice === 'together' ? 'Boa hipótese!' : 'Parece intuitivo, mas vamos testar essa ideia.'} Sem resistência do ar, ambas têm a mesma aceleração gravitacional. Por isso chegam juntas. Com ar, forma e resistência também importam.`)], { done: () => this.completeEvent('physics-question') });
  }
  finishEvent(event) {
    const message = event.id === 'lost-book' ? 'Você encontrou! Obrigada por trazer de volta. Agora posso terminar o capítulo — e você ganhou uma parceira para conversar sobre livros.' : 'Você percebeu as pausas! É nelas que a melodia respira. Obrigado por compartilhar a descoberta; quando quiser, o jogo de ritmo está no pavilhão.';
    this.say(event.npc, [line(event.npc === 'bia' ? 'BIA' : 'DAVI', message)], { done: () => this.completeEvent(event.id) });
  }
  completeEvent(id) {
    if (eventAction(this.state, id, 'complete')) { const event = EVENT_DATA.find(e => e.id === id); this.audio.setMood('completion'); this.changed(`★ ${event.achievement} · encontro concluído`); }
  }
  friendConversation(npc) {
    this.say(npc.id, [line(npc.name.toUpperCase(), npc.friendLine)], { choices: [
      { label: 'Vamos fazer uma atividade', action: () => { this.state.decisions[`friend:${npc.id}`] = 'activity'; this.friendActivity(npc); } },
      { label: 'Prefiro conversar', action: () => { this.state.decisions[`friend:${npc.id}`] = 'talk'; this.say(npc.id, [line(npc.name.toUpperCase(), 'Combinado. Às vezes a melhor parte do intervalo é não ter pressa para chegar à próxima tarefa.')], { done: () => this.save() }); } },
    ] });
  }
  friendActivity(npc) {
    const activity = FRIEND_ACTIVITIES.find(a => a.npc === npc.id); if (!activity || (this.state.reputation[npc.id] || 0) < 2) return;
    this.say(npc.id, [line(npc.name.toUpperCase(), `${activity.title}: ${activity.question}`)], { choices: activity.options.map((label, option) => ({ label, action: () => {
      this.say(npc.id, [line(npc.name.toUpperCase(), `${option === activity.answer ? 'Boa resposta!' : 'Vamos pensar juntos.'} ${activity.explanation}`)], { done: () => { solveFriendActivity(this.state, npc.id, option); this.changed('Atividade de amizade registrada.'); } });
    } })) });
  }
  canteen() {
    this.say(null, [line('CANTINA', 'Escolha um lanche virtual. Não há compras, dinheiro ou transações reais.')], { choices: [ ['water', 'Água'], ['fruit', 'Fruta'], ['bread', 'Pão de queijo'] ].map(([id, label]) => ({ label, action: () => {
      if (!this.state.snacks.includes(id)) this.state.snacks.push(id); befriend(this.state, 'lia', 'canteen:first'); this.save(); this.audio.play('confirm'); this.notify(`${label} adicionado ao inventário virtual.`);
    } })) });
  }
  activity(id) { const npc = { mem: 'bia', quiz: 'helena', rit: 'davi' }[id]; if (npc) befriend(this.state, npc, `activity:${id}`); this.save(); }
  goal() {
    const e = eventObjective(this.state); if (!e) return null;
    const actor = this.actors.find(a => a.definition.id === e.npc);
    return { ...(e.returnToNPC || e.id === 'physics-question' ? actor.agent.position : e.position), name: e.label };
  }
  renderPage(content, page) {
    if (page === 'history') {
      for (const h of [...this.state.history].reverse()) { const article = element('article', ''); article.className = 'story-card'; article.append(element('strong', h.speaker), element('p', h.text), element('small', h.provenance === 'school-fiction' ? 'Ficção do Colégio Aurora' : h.provenance === 'creative-fiction' ? 'Diálogo criativo do Color' : 'Registro narrativo')); content.append(article); }
      if (!this.state.history.length) content.append(element('p', 'As conversas que você ler serão registradas aqui.'));
    } else if (page === 'campus') {
      content.append(element('p', 'Cinco personagens fictícios têm suas próprias rotinas. A amizade registra ajuda e atividades; não mede o relacionamento entre Lorenzo e Maria.'));
      for (const npc of NPC_DATA) { const article = element('article', ''); article.className = 'story-card'; article.append(element('h3', npc.name), element('p', npc.role), element('p', npc.personality), element('small', `Amizade: ${this.state.reputation[npc.id] || 0}/5 · ${(this.state.reputation[npc.id] || 0) >= 2 ? 'Conversa especial disponível' : 'Ajude ou participe de atividades para conhecer melhor'}`)); content.append(article); }
      for (const event of EVENT_DATA) content.append(element('p', `${this.state.events[event.id] === 'done' ? '✓' : '○'} ${event.title} · ${this.state.events[event.id] || 'Converse com o personagem para começar'}`));
    } else if (page === 'achievements') for (const event of EVENT_DATA) { const article = element('article', ''); article.className = 'story-card'; article.append(element('h3', `${this.state.achievements[event.id] ? '★' : '☆'} ${event.achievement}`), element('p', event.description)); content.append(article); }
    else if (page === 'inventory') { content.append(element('h3', 'Cantina e encontros')); for (const id of this.state.snacks) content.append(element('p', { water: 'Água virtual', fruit: 'Fruta virtual', bread: 'Pão de queijo virtual' }[id])); }
  }
  dispose() { this.campus.dispose(); for (const a of this.actors.slice(1)) { a.character.root.removeFromParent(); a.character.dispose(); } }
}
