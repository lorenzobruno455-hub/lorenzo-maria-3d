export function installPreferences(settings, save, controls) {
  const cleanup=[];let ownedNav=null;
  const ranges = [ ['controls-size', 'controlsSize'], ['controls-opacity', 'controlsOpacity'], ['music-volume', 'musicVolume'], ['effects-volume', 'effectsVolume'] ];
  function apply() {
    document.documentElement.style.setProperty('--controls-size', settings.controlsSize);
    document.documentElement.style.setProperty('--controls-opacity', settings.controlsOpacity);
    for (const [id, key] of ranges) document.getElementById(id).value = settings[key];
  }
  for (const [id, key] of ranges) {const input=document.getElementById(id),handler=e=>{settings[key]=Number(e.target.value);controls.clear();apply();save();};input.addEventListener('input',handler);cleanup.push(()=>input.removeEventListener('input',handler));}
  if (!document.querySelector('.settings-jumps')) {
    const nav=document.createElement('nav');ownedNav=nav; nav.className='settings-jumps'; nav.setAttribute('aria-label','Seções das configurações');
    for (const [label,id] of [['Gráficos','quality'],['Som','music-volume'],['Controles','controls-size']]) {
      const button=document.createElement('button');button.textContent=label;
      button.onclick=()=>{const input=document.getElementById(id);input.closest('label').scrollIntoView({block:'center',behavior:'auto'});input.focus({preventScroll:true});for(const b of nav.children)b.removeAttribute('aria-current');button.setAttribute('aria-current','location');};
      nav.append(button);
    }
    document.getElementById('quality').closest('label').before(nav);
  }
  apply.dispose=()=>{for(const off of cleanup.splice(0))off();ownedNav?.remove();ownedNav=null;};
  apply(); return apply;
}
