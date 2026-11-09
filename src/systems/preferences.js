export function installPreferences(settings, save, controls) {
  const ranges = [ ['controls-size', 'controlsSize'], ['controls-opacity', 'controlsOpacity'], ['music-volume', 'musicVolume'], ['effects-volume', 'effectsVolume'] ];
  function apply() {
    document.documentElement.style.setProperty('--controls-size', settings.controlsSize);
    document.documentElement.style.setProperty('--controls-opacity', settings.controlsOpacity);
    for (const [id, key] of ranges) document.getElementById(id).value = settings[key];
  }
  for (const [id, key] of ranges) document.getElementById(id).addEventListener('input', e => { settings[key] = Number(e.target.value); controls.clear(); apply(); save(); });
  if (!document.querySelector('.settings-jumps')) {
    const nav=document.createElement('nav'); nav.className='settings-jumps'; nav.setAttribute('aria-label','Seções das configurações');
    for (const [label,id] of [['Gráficos','quality'],['Som','music-volume'],['Controles','controls-size']]) {
      const button=document.createElement('button');button.textContent=label;
      button.onclick=()=>{const input=document.getElementById(id);input.closest('label').scrollIntoView({block:'center',behavior:'auto'});input.focus({preventScroll:true});for(const b of nav.children)b.removeAttribute('aria-current');button.setAttribute('aria-current','location');};
      nav.append(button);
    }
    document.getElementById('quality').closest('label').before(nav);
  }
  apply(); return apply;
}
