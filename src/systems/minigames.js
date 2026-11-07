import questions from '../data/quiz.json' with { type: 'json' };
export function shuffled(values, random = Math.random) { const a = [...values]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export class MatchingGame {
  constructor(random = Math.random) { this.cards = shuffled(['🎸', '🏋️', '🚲', '✈️', '🍫', '❤️'].flatMap(x => [x, x]), random); this.flipped = []; this.matched = new Set(); this.moves = 0; this.wait = 0; }
  flip(index) {
    if (this.wait || this.matched.has(index) || this.flipped.includes(index) || !this.cards[index]) return false;
    this.flipped.push(index);
    if (this.flipped.length === 2) { this.moves++; const [a, b] = this.flipped; if (this.cards[a] === this.cards[b]) { this.matched.add(a); this.matched.add(b); this.flipped = []; } else this.wait = .8; } return true;
  }
  update(dt) { if (this.wait) { this.wait = Math.max(0, this.wait - dt); if (!this.wait) { this.flipped = []; return true; } } return false; }
  get done() { return this.matched.size === 12; }
}
export class QuizGame {
  constructor(random = Math.random) { this.index = 0; this.score = 0; this.random = random; this.order = shuffled([0, 1, 2], random); }
  get question() { return questions[this.index]; }
  answer(index) { if (this.done || !this.order.includes(index)) return false; if (index === this.question.answer) this.score++; this.index++; this.order = shuffled([0, 1, 2], this.random); return true; }
  get done() { return this.index >= questions.length; }
}
export class RhythmGame {
  constructor() { this.time = 0; this.round = 0; this.score = 0; this.pressed = false; this.feedback = ''; }
  update(dt) { if (this.done) return; this.time += Math.min(dt, .1); if (this.time >= 1.6) { this.time -= 1.6; this.round++; this.pressed = false; this.feedback = ''; } }
  hit() { if (this.done || this.pressed) return 0; this.pressed = true; const d = Math.abs(this.phase - .5), score = d < .07 ? 2 : d < .16 ? 1 : 0; this.score += score; this.feedback = score === 2 ? 'PERFEITO! +2' : score ? 'Bom! +1' : 'Fora do tempo...'; return score; }
  get phase() { return this.time / 1.6; }
  get done() { return this.round >= 10; }
}
