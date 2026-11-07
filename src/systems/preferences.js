export function installPreferences(settings, save, controls) {
  const ranges = [ ['controls-size', 'controlsSize'], ['controls-opacity', 'controlsOpacity'], ['music-volume', 'musicVolume'], ['effects-volume', 'effectsVolume'] ];
  function apply() {
    document.documentElement.style.setProperty('--controls-size', settings.controlsSize);
    document.documentElement.style.setProperty('--controls-opacity', settings.controlsOpacity);
    for (const [id, key] of ranges) document.getElementById(id).value = settings[key];
  }
  for (const [id, key] of ranges) document.getElementById(id).addEventListener('input', e => { settings[key] = Number(e.target.value); controls.clear(); apply(); save(); });
  apply(); return apply;
}
