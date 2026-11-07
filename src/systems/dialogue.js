export class Dialogue {
  constructor({ root, speaker, speech, next, onState, onLine, reducedMotion = () => false }) {
    Object.assign(this, { root, speaker, speech, next, onState, onLine, reducedMotion });
    this.lines = []; this.index = 0; this.elapsed = 0; this.visible = 0; this.open = false;
    this.choices = document.createElement('div'); this.choices.className = 'dialogue-choices'; speech.after(this.choices);
    this.tag = document.createElement('small'); this.tag.className = 'dialogue-source'; speaker.after(this.tag);
    const speed = document.createElement('button'); speed.id = 'dialogue-speed'; speed.textContent = 'Mostrar texto'; next.after(speed); speed.onclick = () => this.reveal();
    const exit = document.createElement('button'); exit.id = 'dialogue-exit'; exit.textContent = 'Encerrar conversa'; speed.after(exit); exit.onclick = () => this.close(false);
    this.onKey = e => { if (this.open && e.key === ' ' && !/BUTTON|INPUT|SELECT/.test(document.activeElement?.tagName)) { e.preventDefault(); this.reveal(); } };
    document.addEventListener('keydown', this.onKey);
  }
  start(lines, { done = null, choices = [], instant = false } = {}) {
    this.lines = lines; this.index = 0; this.done = done; this.options = choices; this.instant = instant; this.open = true;
    this.root.hidden = false; this.onState(true); this.showLine(); this.next.onclick = () => this.advance(); this.next.focus();
  }
  showLine() {
    const line = this.lines[this.index]; this.elapsed = 0; this.visible = 0; this.speaker.textContent = line.speaker;
    this.root.querySelector('.portrait').textContent = line.speaker[0];
    this.tag.textContent = line.provenance === 'school-fiction' ? 'Personagem ou acontecimento fictício · Colégio Aurora' : line.provenance === 'creative-fiction' ? 'Diálogo criativo do jogo Color · não é transcrição' : line.provenance === 'author-reported-memory' ? 'Memória relatada pelo autor' : '';
    this.speech.textContent = ''; this.choices.replaceChildren(); this.next.hidden = false;
    this.onLine?.(line); if (this.instant || this.reducedMotion()) this.reveal();
  }
  update(dt) { if (!this.open) return; this.elapsed += dt; const text = this.lines[this.index].text; const count = Math.min(text.length, Math.floor(this.elapsed * 55)); if (count > this.visible) { this.visible = count; this.speech.textContent = text.slice(0, count); } }
  reveal() { if (!this.open) return; const text = this.lines[this.index].text; this.visible = text.length; this.elapsed = text.length / 55; this.speech.textContent = text; }
  advance() {
    if (!this.open) return; if (this.visible < this.lines[this.index].text.length) { this.reveal(); return; }
    if (this.index < this.lines.length - 1) { this.index++; this.showLine(); return; }
    if (this.options.length) {
      this.next.hidden = true; this.choices.replaceChildren();
      this.options.forEach(option => { const button = document.createElement('button'); button.textContent = option.label; button.onclick = () => { this.close(false); option.action(); }; this.choices.append(button); }); this.choices.firstChild?.focus();
    } else this.close(true);
  }
  close(complete = false) { if (!this.open) return; this.open = false; this.root.hidden = true; this.choices.replaceChildren(); this.next.hidden = false; this.next.blur(); const done = this.done; this.done = null; this.onState(false); if (complete) done?.(); }
  dispose() { this.close(); document.removeEventListener('keydown', this.onKey); }
}
