/**
 * Lightweight DOM comic accents. These never block canvas/touch input and
 * intentionally do not animate if the user requests reduced motion.
 */
export class VisualEffects {
  constructor(root = document.body, reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches) {
    this.root = root;
    this.reducedMotion = reducedMotion;
    this.active = new Set();
    this.timers = new Set();
  }
  burst(text = 'DESCOBERTA!') {
    if (this.reducedMotion()) return;
    const node = document.createElement('div');
    node.className = 'colorbeat-burst';
    node.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.className = 'colorbeat-burst-label';
    label.textContent = text;
    node.appendChild(label);
    this.root.appendChild(node);
    this.active.add(node);
    const timer = setTimeout(() => {
      node.remove();
      this.active.delete(node);
      this.timers.delete(timer);
    }, 1000);
    this.timers.add(timer);
  }
  dispose() {
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
    for (const node of this.active) node.remove();
    this.active.clear();
  }
}
