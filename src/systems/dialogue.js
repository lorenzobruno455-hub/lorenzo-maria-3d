export class Dialogue {
  constructor({ root, speaker, speech, next, onState, onLine, reducedMotion = () => false }) {
    Object.assign(this, { root, speaker, speech, next, onState, onLine, reducedMotion });
    root.classList.add('comic-panel');
    this.lineListeners = new Set(); this.lines = []; this.index = 0; this.elapsed = 0; this.visible = 0; this.open = false;
    this.choices = document.createElement('div'); this.choices.className = 'dialogue-choices'; speech.after(this.choices);
    this.tag = document.createElement('small'); this.tag.className = 'dialogue-source'; speaker.after(this.tag);
    const speed = document.createElement('button'); speed.id = 'dialogue-speed'; speed.textContent = 'Mostrar texto'; next.after(speed); speed.onclick = () => this.reveal();
    const exit = document.createElement('button'); exit.id = 'dialogue-exit'; exit.textContent = 'Encerrar conversa'; speed.after(exit); exit.onclick = () => this.close(false);
    this.actions=document.createElement('div');this.actions.className='dialogue-actions';next.before(this.actions);this.actions.append(next,speed,exit);speech.tabIndex=0;
    this.onKey = e => { if (this.open && e.key === ' ' && !/BUTTON|INPUT|SELECT/.test(document.activeElement?.tagName)) { e.preventDefault(); this.reveal(); } };
    document.addEventListener('keydown', this.onKey);
  }
  start(lines, { done = null, choices = [], instant = false } = {}) {
    this.lines = lines.map(line=>({...line,speaker:({'BIA':'RAFAELLA','CAIO':'PORVA','PROF. HELENA':'PROF NEWMARA','HELENA':'PROF NEWMARA','DAVI':'BASSARAB','LIA':'HELÔ',bia:'RAFAELLA',caio:'PORVA',helena:'PROF NEWMARA',davi:'BASSARAB',lia:'HELÔ'})[line.speaker]||line.speaker})); this.index = 0; this.done = done; this.options = choices; this.instant = instant; this.open = true;
    this.root.hidden = false; this.onState(true); this.showLine(); this.next.onclick = () => this.advance(); this.next.focus();
  }
  showLine() {
    const line = this.lines[this.index]; this.elapsed = 0; this.visible = 0; this.speaker.textContent = line.speaker;
    this.root.querySelector('.portrait').textContent = line.speaker[0];
    this.tag.textContent = ({real_report:'Relato do autor · resposta recordada',documentary_summary:'Resumo documental',adapted:'Cena dramatizada · falas recriadas',fictional:'Ficção narrativa · não é registro histórico',pending_verification:'Ficção documental · contexto histórico pendente'})[line.provenance] || (line.provenance === 'school-fiction' ? 'Personagem ou acontecimento fictício · Colégio Aurora' : line.provenance === 'creative-fiction' ? 'Diálogo criativo do jogo Color · não é transcrição' : line.provenance === 'author-reported-memory' ? 'Memória relatada pelo autor' : '');
    this.speech.textContent = ''; this.choices.replaceChildren(); this.next.hidden = false;
    this.onLine?.(line); for (const listener of this.lineListeners) listener(line,this.index); if (this.instant || this.reducedMotion()) this.reveal();
  }
  update(dt) { if (!this.open || this.paused) return; this.elapsed += dt; const text = this.lines[this.index].text; const count = Math.min(text.length, Math.floor(this.elapsed * 55)); if (count > this.visible) { this.visible = count; this.speech.textContent = text.slice(0, count); } }
  reveal() { if (!this.open || this.paused) return; const text = this.lines[this.index].text; this.visible = text.length; this.elapsed = text.length / 55; this.speech.textContent = text; }
  advance() {
    if (!this.open || this.paused) return; if (this.visible < this.lines[this.index].text.length) { this.reveal(); return; }
    if (this.index < this.lines.length - 1) { this.index++; this.showLine(); return; }
    if (this.options.length) {
      this.next.hidden = true; this.choices.replaceChildren();
      this.options.forEach(option => { const button = document.createElement('button'); button.textContent = option.label; button.onclick = () => { this.close(false); option.action(); }; this.choices.append(button); }); this.choices.firstChild?.focus();
    } else this.close(true);
  }
  close(complete = false) { if (!this.open) return; this.paused=false; this.open = false; this.root.hidden = true; this.choices.replaceChildren(); this.next.hidden = false; this.next.blur(); const done = this.done; this.done = null; this.onState(false); if (complete) done?.(); }
  listen(listener) { this.lineListeners.add(listener); return () => this.lineListeners.delete(listener); }
  dispose() { this.lineListeners.clear(); this.close(); document.removeEventListener('keydown', this.onKey); }
}
