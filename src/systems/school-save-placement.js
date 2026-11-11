import {resolveSpawn} from './physics.js';
import {schoolBoundsToWorld} from './world-coordinates.js';

// An old world save may coincide with a wall after the whole-building rotation.
// Keep clear exterior saves exact; repair into nearby exterior, never unloaded rooms.
export function resolveSchoolExteriorSave(position,solids,rotation){
 const footprint=schoolBoundsToWorld({minX:-11.12,maxX:11.12,minZ:-19.12,maxZ:19.12},rotation);
 return resolveSpawn(position,[...solids,footprint],{x:44,z:5.5});
}
