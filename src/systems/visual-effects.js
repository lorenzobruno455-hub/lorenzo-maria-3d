/** Bounded original comic accents, decorative and pointer-safe. */
export class VisualEffects {
  constructor(root = document.body, reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches) {
    this.root = root; this.reducedMotion = reducedMotion;
    this.active = new Set(); this.timers = new Set(); this.pool = []; this.disposed = false;
  }
  burst(text = 'DESCOBERTA!', kind = 'discover') {
    if (this.disposed || this.reducedMotion() || this.active.size >= 2) return false;
    const node = this.pool.pop() || document.createElement('div');
    node.className = 'colorbeat-burst';
    node.dataset.kind = ['memory', 'quest', 'chapter', 'discover'].includes(kind) ? kind : 'discover';
    node.setAttribute('aria-hidden', 'true');
    const label = node.firstElementChild || document.createElement('span');
    label.className = 'colorbeat-burst-label'; label.textContent = String(text).slice(0, 64);
    node.appendChild(label); this.root.appendChild(node); this.active.add(node);
    const timer = setTimeout(() => {
      node.remove(); this.active.delete(node);
      if (!this.disposed) this.pool.push(node);
      this.timers.delete(timer);
    }, 1000);
    this.timers.add(timer); return true;
  }
  memory(text = 'MEMÓRIA!') { return this.burst(text, 'memory'); }
  quest(text = 'OBJETIVO CONCLUÍDO!') { return this.burst(text, 'quest'); }
  chapter(text = 'NOVO CAPÍTULO') { return this.burst(text, 'chapter'); }
  dispose() {
    this.disposed = true; this.pool.length = 0;
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
    for (const node of this.active) node.remove();
    this.active.clear();
  }
}
