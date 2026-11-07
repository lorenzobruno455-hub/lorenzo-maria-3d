import { chapters, memories, currentChapter, nextStep, questEvent, unlockMemory, recordGame, freshCampaign } from './quests.js';
import { checkAchievements, definitions } from './achievements.js';
import catalogue from '../data/minigames.json' with { type: 'json' };
import rewards from '../data/rewards.json' with { type: 'json' };
import { createStoryWorld } from './story-world.js';
import { MatchingGame, QuizGame, RhythmGame } from './minigames.js';

const el = (tag, text, className) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; };
const button = (label, action) => { const b = el('button', label); b.onclick = action; return b; };
export class Story {
  constructor({ scene, world, getProgress, save, notify, dialogue, onPanel, audio, start, tutorial, living }) {
    Object.assign(this, { getProgress, save, notify, dialogue, onPanel, audio, start, tutorial, living });
    this.world = createStoryWorld(scene, world, memories, catalogue); this.panel = document.getElementById('story-panel'); this.content = document.getElementById('story-content');
    this.open = false; this.game = null; this.time = 0; this.finishedGame = false; this.dialogueData = null;
    this.reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
    document.getElementById('welcome-free').onclick = () => { this.living.setMode('free'); this.close(); this.start(); };
    document.getElementById('story-close').onclick = () => this.close();
    document.querySelectorAll('[data-story]').forEach(b => b.onclick = () => this.show(b.dataset.story));
    this.key = e => { if (this.gameReady && this.game instanceof RhythmGame && e.code === 'Space' && !e.repeat) { e.preventDefault(); this.game.hit(); this.audio.play('collect'); } };
    document.addEventListener('keydown', this.key);
  }
  get c() { return this.getProgress().campaign; }
  changed() { const achievements = checkAchievements(this.c); this.save(); if (achievements.length) this.notify(`★ ${achievements.map(a => a.name).join(' · ')}`); }
  close() { this.game = null; this.open = false; this.panel.hidden = true; this.content.replaceChildren(); this.onPanel(false); this.audio.setMood?.('exploration'); }
  show(name) {
    this.game = null; this.open = true; this.panel.hidden = false; this.content.replaceChildren(); this.onPanel(true); this.audio.setMood?.('conversation');
    const title = { menu: 'Memórias de uma história', album: 'Álbum de memórias', chapters: 'Capítulos', inventory: 'Inventário', games: 'Minijogos', achievements: 'Conquistas', letter: 'Para a Maria', campus: 'O Colégio Vivo', history: 'Histórico de conversas' }[name];
    document.getElementById('story-title').textContent = title; this.page = name;
    if (name === 'menu') {
      this.content.append(el('p', 'Explore a escola, converse com Maria e descubra as seis memórias relatadas pelo autor. As conversas criativas são identificadas separadamente.'));
      for (const [label, action] of [['Continuar', () => { this.close(); this.start(); }], ['Exploração livre', () => { this.living.setMode('free'); this.close(); this.start(); }], ['Retomar campanha', () => { this.living.setMode('campaign'); this.close(); this.start(); }], ['Colégio vivo', () => this.show('campus')], ['Histórico de conversas', () => this.show('history')], ['Nova campanha', () => this.newCampaign()], ['Capítulos', () => this.show('chapters')], ['Álbum', () => this.show('album')], ['Inventário', () => this.show('inventory')], ['Minijogos', () => this.show('games')], ['Conquistas', () => this.show('achievements')], ['Carta final', () => this.show('letter')], ['Configurações', () => { this.close(); this.start(); document.getElementById('pause-button').click(); }]]) this.content.append(button(label, action));
    } else if (name === 'chapters') {
      this.content.append(button('Prólogo · Primeiro sinal (três lembranças)', () => { this.close(); this.start(); this.tutorial(); }));
      chapters.forEach((chapter, i) => { const card = el('article', undefined, 'story-card'); card.append(el('small', chapter.date), el('h3', chapter.title));
        const unlocked = i <= this.c.memories.length; card.append(el('p', this.c.memories.length > i ? '✓ Concluído' : unlocked ? 'Disponível após o prólogo' : 'Conclua o capítulo anterior'));
        for (const step of chapter.steps) card.append(el('p', `${(this.c.steps[chapter.id] || []).includes(step.id) ? '✓' : '○'} ${step.label}`)); this.content.append(card); });
      this.content.append(el('h3', 'Missões secundárias · atividades opcionais'));
      catalogue.filter(g => g.playable).forEach(g => { const card = el('article', undefined, 'story-card'); card.append(el('h3', g.title), el('p', `${this.c.results[g.id]?.completed ? '✓ Concluída' : '○ Objetivo: concluir a atividade'} · ${g.environment}`), button('Acompanhar objetivo', () => { this.tracked = { ...g.position, name: g.environment }; this.close(); this.start(); })); this.content.append(card); });
    } else if (name === 'album') this.album();
    else if (name === 'inventory') {
      this.content.append(el('h3', `Cartas e memórias · ${this.c.memories.length}/6`));
      memories.filter(m => this.c.memories.includes(m.id)).forEach(m => this.content.append(el('p', `${m.date} · ${m.title}`)));
      this.content.append(el('h3', 'Objetos especiais')); [...this.getProgress().collected, ...this.c.special].forEach(id => this.content.append(el('p', ({ notebook: 'Caderno de literatura', card: 'Cartão da biblioteca', photo: 'Fotografia do jardim', 'garden-letter': 'Carta do jardim (objeto virtual)', flowers: 'Flores (objeto virtual)', reflection: 'Voz do Narrador', duo: 'Dupla Dinâmica', moon: 'Pequena lua' })[id] || id)));
      this.content.append(el('h3', 'Vales virtuais · sem compras ou transações')); rewards.vouchers.filter(v => this.c.vouchers.includes(v.id)).forEach(v => this.content.append(el('p', `Vale: ${v.name}`)));
      this.content.append(el('h3', `Conquistas · ${Object.keys(this.c.achievements).length}`)); this.content.append(button('Ver conquistas', () => this.show('achievements')));
    } else if (name === 'games') {
      catalogue.forEach(g => { const card = el('article', undefined, 'story-card'); card.append(el('h3', g.title), el('p', g.playable ? `${g.environment} · atividade disponível no objeto da escola` : 'Planejado · indisponível nesta versão'));
        const result = this.c.results[g.id]; if (result) card.append(el('p', `Melhor pontuação: ${result.score}${result.completed ? ' · concluído' : ''}`));
        if (g.playable) card.append(button('Localizar na escola', () => { this.tracked = { ...g.position, name: g.environment }; this.close(); this.start(); this.notify(`Vá para: ${g.environment}`); })); this.content.append(card); });
    } else if (name === 'achievements') definitions.forEach(a => { const stamp = this.c.achievements[a.id]; const card = el('article', undefined, 'story-card'); card.append(el('h3', `${stamp ? '★' : '☆'} ${a.secret && !stamp ? 'Conquista secreta' : a.name}`), el('p', a.secret && !stamp ? 'Explore a escola.' : a.description), el('small', stamp ? `Obtida: ${new Date(stamp).toLocaleDateString('pt-BR')}` : a.available ? 'Pendente' : 'Indisponível · atividade planejada')); this.content.append(card); });
    else if (name === 'letter') { this.content.append(el('p', this.c.letter ? rewards.letter.text : 'Conclua os seis capítulos para abrir a carta final.', 'letter-text')); }
    this.living?.renderPage(this.content, name);
    document.getElementById('story-close').focus();
  }
  newCampaign() {
    this.content.replaceChildren(el('p', 'Iniciar uma nova campanha? O prólogo e suas configurações serão mantidos; memórias, conquistas e resultados desta campanha serão reiniciados.'));
    this.content.append(button('Confirmar nova campanha', () => { this.getProgress().campaign = freshCampaign(); this.living.setMode('campaign'); this.changed(); this.close(); this.start(); }), button('Cancelar', () => this.show('menu')));
  }
  album() {
    const toolbar = el('div', undefined, 'album-filters'), rarity = el('select'), order = el('select'), date = el('select'); date.setAttribute('aria-label', 'Filtrar por data');
    for (const value of ['', ...memories.map(m => m.date)]) { const option = el('option', value || 'Todas as datas'); option.value = value; date.append(option); } rarity.setAttribute('aria-label', 'Filtrar por raridade'); order.setAttribute('aria-label', 'Ordenar por data');
    for (const value of ['', 'RARA', 'ÉPICA', 'LENDÁRIA']) { const option = el('option', value || 'Todas as raridades'); option.value = value; rarity.append(option); }
    for (const [value, text] of [['asc', 'Data crescente'], ['desc', 'Data decrescente']]) { const option = el('option', text); option.value = value; order.append(option); }
    const grid = el('div', undefined, 'album-grid'); const draw = () => { grid.replaceChildren(); const list = memories.filter(m => (!rarity.value || m.rarity === rarity.value) && (!date.value || m.date === date.value)); if (order.value === 'desc') list.reverse();
      list.forEach(m => { const unlocked = this.c.memories.includes(m.id), card = el('article', undefined, `story-card rarity-${m.rarityLevel}`); card.append(el('small', `${m.rarity} · ${unlocked ? m.date : 'Bloqueada'}`), el('h3', unlocked ? m.title : '? ? ?'), el('p', unlocked ? m.description : 'Descubra esta memória na escola.'));
        if (unlocked) card.append(button('Revisitar memória', () => { this.close(); this.start(); this.memory(m, true); })); grid.append(card); }); };
    toolbar.append(rarity, date, order); this.content.append(toolbar, grid); rarity.onchange = date.onchange = order.onchange = draw; draw();
  }
  async chooseDialogue(category) {
    this.dialogueData ||= (await import('../data/dialogues.json')).default;
    const c = this.c, key = category, rows = this.dialogueData.filter(d => category === 'memórias' ? d.source === 'NN' : d.category === category);
    const pool = (rows.length ? rows : this.dialogueData.filter(d => d.category === 'cotidianas')).filter(d => d.id !== c.lastDialogue[key] && d.id !== c.lastSpoken);
    const first = pool[Math.floor(Math.random() * pool.length)]; c.lastDialogue[key] = first.id;
    const responsePool = this.dialogueData.filter(d => d.source === (first.source === 'MM' ? 'LL' : 'MM') && d.category === category && d.id !== c.lastDialogue[`${key}-reply`]);
    const second = responsePool[Math.floor(Math.random() * responsePool.length)]; if (second) c.lastDialogue[`${key}-reply`] = second.id;
    this.dialogue.start([first, ...(second ? [second] : [])], { done: () => { c.lastSpoken = second?.id || first.id; c.talks += second ? 2 : 1; if (first.source === 'NN') { if (!c.special.includes('reflection')) c.special.push('reflection'); } if (!this.living.free) questEvent(c, 'talk'); this.changed(); } });
  }
  maria() {
    const line = { speaker: 'MENU', text: 'Escolha um tema de conversa do jogo Color.', provenance: 'creative-fiction' };
    this.dialogue.start([line], { instant: true, choices: [...['cotidianas', 'humor', 'filosofia', 'música', 'escola', 'fé', 'memórias', 'especiais'].map(category => ({ label: category[0].toUpperCase() + category.slice(1), action: () => this.chooseDialogue(category) })), { label: 'Dupla Dinâmica', action: () => { if (!this.c.special.includes('duo')) this.c.special.push('duo'); this.changed(); this.dialogue.start([{ speaker: 'SISTEMA', text: 'COMBO: Dupla Dinâmica! Lorenzo +100 de felicidade. Maria +100 de paciência. Duração: indefinida.', provenance: 'creative-fiction' }]); } }, { label: 'Prólogo: três lembranças', action: () => this.tutorial() }] });
    this.dialogue.advance();
  }
  memory(m, replay = false) {
    if (this.living.free && !replay) { this.notify('Retome a campanha para desbloquear novas memórias.'); return; }
    if (!replay && (this.getProgress().stage < 2 || currentChapter(this.c)?.id !== m.quest || nextStep(this.c)?.type !== 'memory')) { this.notify(this.getProgress().stage < 2 ? 'Conclua o prólogo das três lembranças primeiro.' : nextStep(this.c)?.label || 'Conclua o capítulo anterior.'); return; }
    this.focus = { ...m.position, y: 1.1 }; this.audio.setMood?.('memory');
    this.dialogue.start([{ speaker: 'MEMÓRIA', text: `${m.date} · ${m.title}`, provenance: 'author-reported-memory' }, { speaker: 'LORENZO', text: m.description, provenance: 'author-reported-memory' }], { done: () => {
      if (!replay && unlockMemory(this.c, m.id)) { this.changed(); this.audio.play('collect'); this.audio.setMood?.('completion'); this.notify(`◇ ${m.title} · carta desbloqueada${this.c.letter ? ' · Carta final disponível!' : ''}`); }
      this.focus = null;
    } }); this.audio.setMood?.('memory');
  }
  interact(target) {
    this.tracked = null;
    if (target.kind === 'album') { this.show('album'); return; }
    if (target.kind === 'game') { this.launchGame(target.id); return; }
    if (target.kind === 'secret') { if (!this.c.special.includes('moon')) this.c.special.push('moon'); this.changed(); this.notify('A lua também sente saudade.'); return; }
    if (target.kind === 'memory') this.memory(memories.find(m => m.id === target.id), this.c.memories.includes(target.id));
  }
  launchGame(id) {
    if (!catalogue.some(g => g.id === id && g.playable)) return;
    this.show('games'); this.page = 'play'; this.gameId = id; this.finishedGame = false;
    this.game = id === 'mem' ? new MatchingGame() : id === 'quiz' ? new QuizGame() : new RhythmGame();
    this.gameReady = false;
    this.audio.setMood?.(id === 'rit' ? 'minigame' : 'memory'); this.drawGame();
  }
  drawGame() {
    const g = this.game; if (!g) return; this.content.replaceChildren();
    document.getElementById('story-title').textContent = catalogue.find(row => row.id === this.gameId).title;
    if (!this.gameReady) { const instructions = { mem: 'Encontre os seis pares. Cada tentativa de duas cartas conta uma jogada. Complete todos os pares para vencer.', quiz: 'Responda às seis perguntas. Cinco acertos liberam a conquista. Você pode encerrar e tentar novamente.', rit: 'Dez notas atravessam o alvo. Toque ou pressione Espaço no centro dourado. Faça 12 pontos para a conquista.' }; this.content.append(el('p', instructions[this.gameId]), button('Iniciar atividade', () => { this.gameReady = true; this.drawGame(); })); return; }
    document.getElementById('story-title').textContent = catalogue.find(row => row.id === this.gameId).title;
    if (g.done) { if (g instanceof QuizGame) this.content.append(el('p', g.score >= 5 ? 'Casal nerd confirmado! Conquista liberada.' : 'Quase! Faça 5 para a conquista.')); this.content.append(el('h3', `Concluído · ${g instanceof MatchingGame ? g.moves + ' jogadas' : g.score + ' pontos'}`), button('Jogar novamente', () => this.launchGame(this.gameId))); if (!this.finishedGame) { this.finishedGame = true; recordGame(this.c, this.gameId, g instanceof MatchingGame ? Math.max(1, 100 - g.moves) : g.score, true); this.living.activity(this.gameId); this.changed(); } return; }
    if (g instanceof MatchingGame) { this.content.append(el('p', `Encontre os seis pares · ${g.moves} jogadas`)); const grid = el('div', undefined, 'matching-grid'); g.cards.forEach((card, i) => { const up = g.flipped.includes(i) || g.matched.has(i); const b = button(up ? card : '?', () => { g.flip(i); this.audio.play('collect'); this.drawGame(); }); b.setAttribute('aria-label', `Carta ${i + 1}${up ? ': ' + card : ' fechada'}`); b.dataset.card = i; b.disabled = g.matched.has(i) || !!g.wait; grid.append(b); }); this.content.append(grid); }
    else if (g instanceof QuizGame) { this.content.append(el('small', `Pergunta ${g.index + 1}/6 · ${g.score} pontos`), el('h3', g.question.question)); for (const i of g.order) this.content.append(button(g.question.options[i], () => { g.answer(i); this.drawGame(); })); }
    else { this.content.append(el('p', 'Toque no botão ou pressione Espaço quando o coração passar pelo centro dourado. Dez notas, até vinte pontos.')); const lane = el('div', undefined, 'rhythm-lane'), marker = el('span', '♥'); marker.id = 'rhythm-note'; lane.append(marker); this.content.append(lane, el('p', '', 'rhythm-status'), button('Marcar o compasso', () => { g.hit(); this.audio.play('collect'); })); }
  }
  update(dt, position, active) {
    this.time += dt; this.world.update(this.c, this.time, this.focus);
    if (this.focus && !this.dialogue.open) this.focus = null;
    if (active && !this.living.free && this.getProgress().stage === 2) {
      const step = nextStep(this.c); if (step?.type === 'visit' && Math.hypot(position.x - step.position.x, position.z - step.position.z) < 3) { const chapter = currentChapter(this.c); questEvent(this.c, 'visit'); if (chapter?.id === 'chapter-2' && !this.c.special.includes('garden-letter')) this.c.special.push('garden-letter'); if (chapter?.id === 'chapter-5' && !this.c.special.includes('flowers')) this.c.special.push('flowers'); this.changed(); this.notify(nextStep(this.c)?.label || 'Explore a memória.'); }
    }
    if (this.game && this.gameReady && !document.hidden) {
      const g = this.game; if (g instanceof MatchingGame) { if (g.update(dt)) this.drawGame(); }
      else if (g instanceof RhythmGame) { g.update(dt); const note = this.content.querySelector('#rhythm-note'), status = this.content.querySelector('.rhythm-status'); if (note) note.style.left = `${g.phase * 94}%`; if (status) status.textContent = `Nota ${Math.min(10, g.round + 1)}/10 · ${g.score} pontos · ${g.feedback}`; if (g.done) this.drawGame(); }
    }
  }
  goal() {
    if (this.tracked) return this.tracked;
    if (this.living.goal()) return this.living.goal();
    if (this.living.free) return null;
    if (this.getProgress().stage !== 2) return null;
    const step = nextStep(this.c), chapter = currentChapter(this.c);
    return step ? { ...(step.type === 'talk' ? this.living.mariaPosition : memories.find(m => m.quest === chapter.id).position), name: step.label } : null;
  }
  objective() { if (this.living.goal()) return this.living.goal().name; if (this.living.free) return this.living.goal()?.name || 'Exploração livre · converse com a turma, visite a cantina e descubra os encontros da escola.'; const chapter = currentChapter(this.c); return chapter ? `Capítulo ${this.c.memories.length + 1} · ${chapter.title}\n${nextStep(this.c)?.label || ''}` : 'Seis memórias descobertas! Abra a carta final no menu.'; }
  dispose() { document.removeEventListener('keydown', this.key); this.close(); this.world.dispose(); }
}
