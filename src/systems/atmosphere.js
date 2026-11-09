import {COLORBEAT_LIGHT} from './colorbeat-lighting.js';
export function updateAtmosphere(renderer, follow, player, quality, dt, world) {
  const indoors = player.z < -5.5 && player.z > -17 && Math.abs(player.x) > 6 && Math.abs(player.x) < 28;
  follow.interiorDistance = indoors ? 4.7 : 7;
  for(const fill of world.interiorLights){fill.intensity=(COLORBEAT_LIGHT.fill[quality]||8)*1.3;fill.color.set(COLORBEAT_LIGHT.warm);}
  return indoors;
}
