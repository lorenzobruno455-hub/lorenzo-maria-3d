import playlist from './playlist.json';
import './radio.css';

// O Vite serve public/radio/audio sem copiar os MP3 para o bundle JS.
// Retorna função de limpeza para telas que desmontam a HUD.
export function mountLorenzoMariaRadio({ container = document.body, onPlaybackChange = () => {} } = {}) {
  if (document.querySelector('.lm-radio')) return () => {};
  const stations = [
    ['lorenzo', '🎸 LorenzoFM'],
    ['maria', '🌷 MariaFM'],
    ['juntos', '❤️ LorenzoeMariaFM'],
  ];
  const icon = {
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h3v16H5zM20 4v16L8 12z"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 4h3v16h-3zM4 4v16l12-8z"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5 20 12 7 19.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
  };
  const root = document.createElement('section');
  root.className = 'lm-radio';
  root.setAttribute('aria-label', 'Rádio do jogo');
  root.innerHTML = `
    <button type="button" class="lm-radio__collapse" data-radio-action="collapse" aria-label="Minimizar rádio" aria-expanded="true">−</button>
    <select class="lm-radio__station" aria-label="Selecionar rádio">
      ${stations.map(([key, label]) => `<option value="${key}">${label}</option>`).join('')}
    </select>
    <div class="lm-radio__controls">
      <button type="button" class="lm-radio__btn" data-radio-action="prev" aria-label="Faixa anterior">${icon.prev}</button>
      <button type="button" class="lm-radio__btn lm-radio__btn--main" data-radio-action="toggle" aria-label="Reproduzir">${icon.play}</button>
      <button type="button" class="lm-radio__btn" data-radio-action="next" aria-label="Próxima faixa">${icon.next}</button>
    </div>
    <div class="lm-radio__title" aria-live="polite"></div>`;
  container.append(root);
  // Capturar toques evita que comandos da HUD disparem comandos do mundo 3D.
  for (const eventName of ['pointerdown','pointerup','touchstart','touchend','wheel','keydown']) {
    root.addEventListener(eventName, (event) => event.stopPropagation(), { passive: true });
  }
  const audio = new Audio();
  audio.preload = 'none';
  audio.hidden = true;
  audio.setAttribute('aria-hidden', 'true');
  root.append(audio);
  const select = root.querySelector('select');
  const titleEl = root.querySelector('.lm-radio__title');
  const toggle = root.querySelector('[data-radio-action="toggle"]');
  const base = import.meta.env.BASE_URL || '/';
  let station = 'lorenzo';
  let current = -1;
  let bag = [];
  let history = [];
  let historyPos = -1;
  let disposed = false;
  let lastPlaying = false;
  const items = () => playlist[station];
  const trackUrl = track => `${base}radio/audio/${track.file}`;
  const shuffle = arr => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  function pullNext() {
    if (!bag.length) {
      bag = shuffle(items().map((_, i) => i));
      // Como usamos pop(), o último item do array será o primeiro da rodada.
      if (bag.length > 1 && bag[bag.length - 1] === current) {
        const j = bag.findIndex(i => i !== current);
        [bag[j], bag[bag.length - 1]] = [bag[bag.length - 1], bag[j]];
      }
    }
    return bag.pop();
  }
  function syncButton() {
    const playing = !audio.paused;
    if (playing !== lastPlaying) {
      lastPlaying = playing;
      onPlaybackChange(playing);
    }
    toggle.innerHTML = audio.paused ? icon.play : icon.pause;
    toggle.setAttribute('aria-label', audio.paused ? 'Reproduzir' : 'Pausar');
  }
  function startPlayback() {
    const track = items()[current];
    if (!track) return;
    const source = new URL(trackUrl(track), document.baseURI).href;
    if (audio.src !== source) audio.src = source;
    audio.play().catch(() => syncButton());
    syncButton();
  }
  function selectTrack(index, keepPaused = audio.paused) {
    if (disposed || index == null) return;
    current = index;
    const track = items()[index];
    titleEl.textContent = track.title;
    if (!keepPaused) {
      audio.src = trackUrl(track);
      audio.play().catch(() => syncButton());
    }
    syncButton();
  }
  function forward() {
    const keepPaused = audio.paused;
    if (historyPos < history.length - 1) {
      historyPos++;
      selectTrack(history[historyPos], keepPaused);
    } else {
      const index = pullNext();
      history = history.slice(0, historyPos + 1);
      history.push(index);
      historyPos = history.length - 1;
      selectTrack(index, keepPaused);
    }
  }
  function backward() {
    if (historyPos > 0) {
      historyPos--;
      selectTrack(history[historyPos], audio.paused);
    } else if (current >= 0) {
      audio.currentTime = 0;
    }
  }
  function switchStation(value) {
    const wasPlaying = !audio.paused;
    audio.pause();
    station = value;
    bag = [];
    history = [];
    historyPos = -1;
    current = -1;
    forward(); // sorteia faixa da estação nova; inicia apenas com gesto de usuário.
    if (wasPlaying) startPlayback();
    syncButton();
  }
  function onClick(event) {
    const target = event.target.closest('[data-radio-action]');
    if (!target) return;
    if (target.dataset.radioAction === 'collapse') {
      const minimized = root.classList.toggle('lm-radio--minimized');
      target.setAttribute('aria-expanded', String(!minimized));
      target.setAttribute('aria-label', minimized ? 'Expandir rádio' : 'Minimizar rádio');
      target.textContent = minimized ? '♫' : '−';
    }
    if (target.dataset.radioAction === 'prev') backward();
    if (target.dataset.radioAction === 'next') forward();
    if (target.dataset.radioAction === 'toggle') {
      if (audio.paused) startPlayback();
      else audio.pause();
    }
  }
  const onEnded = () => {
    // Na finalização natural, mantém a rádio tocando.
    forward();
    startPlayback();
  };
  root.addEventListener('click', onClick);
  select.addEventListener('change', event => switchStation(event.target.value));
  audio.addEventListener('ended', onEnded);
  audio.addEventListener('play', syncButton);
  audio.addEventListener('pause', syncButton);
  audio.addEventListener('error', () => {
    titleEl.textContent = 'Áudio indisponível';
    syncButton();
  });
  switchStation(station);
  return () => {
    disposed = true;
    audio.pause();
    onPlaybackChange(false);
    audio.removeAttribute('src');
    audio.load();
    root.remove();
  };
}
