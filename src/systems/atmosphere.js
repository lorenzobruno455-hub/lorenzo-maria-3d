export function updateAtmosphere(renderer, follow, player, quality, dt, world) {
  const indoors = player.z < -5.5 && player.z > -17 && Math.abs(player.x) > 6 && Math.abs(player.x) < 28;
  const exposure = indoors ? 1.16 : 1;
  renderer.toneMappingExposure += (exposure - renderer.toneMappingExposure) * (1 - Math.exp(-dt * 3));
  follow.interiorDistance = indoors ? 4.7 : 7;
  for (const fill of world.interiorLights) fill.intensity = quality === 'low' ? 8 : quality === 'medium' ? 12 : 14;
  return indoors;
}
