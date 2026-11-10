import * as THREE from 'three';
import {COLORBEAT_STYLE} from './colorbeat-materials.js';
import {NARRATIVE_POINTS,bookPoint} from './school-narrative-map.js';
import { batchMeshes } from './batching.js';

// M1 GLBs encode independent, axis-aligned boxes as 12 flat triangles each.
// Reject other meshes atomically: the original remains the safe fallback.
export function decodeFurnitureBoxes(source) {
  const g = source?.geometry, p = g?.getAttribute('position'), c = g?.getAttribute('color');
  if (!source?.isMesh || g.index || !p || !c || p.itemSize !== 3 || c.itemSize < 3 || !p.count || p.count % 36 || c.count !== p.count) return null;
  const boxes = [];
  for (let start = 0; start < p.count; start += 36) {
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    const rgb = [c.getX(start), c.getY(start), c.getZ(start)];
    for (let i = start; i < start + 36; i++) {
      const q = [p.getX(i), p.getY(i), p.getZ(i)], color = [c.getX(i), c.getY(i), c.getZ(i)];
      if (q.some(v => !Number.isFinite(v)) || color.some((v, k) => !Number.isFinite(v) || Math.abs(v - rgb[k]) > 1e-5)) return null;
      q.forEach((v, k) => { min[k] = Math.min(min[k], v); max[k] = Math.max(max[k], v); });
    }
    if (max.some((v, k) => v - min[k] < 1e-5)) return null;
    for (let i = start; i < start + 36; i++) {
      if ([p.getX(i), p.getY(i), p.getZ(i)].some((v, k) => Math.min(Math.abs(v - min[k]), Math.abs(v - max[k])) > 1e-4)) return null;
    }
    boxes.push({ min, max, size: max.map((v, k) => v - min[k]), center: max.map((v, k) => (v + min[k]) / 2), color: `#${new THREE.Color().setRGB(...rgb).getHexString()}` });
  }
  return boxes;
}

export function createSchoolFurniture({ resources, materials, floor, source }) {
  const boxes = decodeFurnitureBoxes(source);
  if (!boxes) return null;
  const group = new THREE.Group(); group.name = 'school-furniture-detail';
  group.position.copy(source.position); group.quaternion.copy(source.quaternion); group.scale.copy(source.scale);
  const owned = [], supports = [], colliders = [], edgePositions=[];let edges;
  const stats = { sourceBoxes: boxes.length, roundedFaces: 0, details: 0, meshCount: 0, triangles: 0 };
  const add = (kind, center, size, color, finish = 'plain') => {
    const mesh = new THREE.Mesh(resources.geometry(kind), materials.get(color, finish));
    mesh.position.set(...center); mesh.scale.set(size[0] * (kind === 'cylinder' ? .5 : 1), size[1], size[2] * (kind === 'cylinder' ? .5 : 1)); mesh.castShadow = mesh.receiveShadow = true; group.add(mesh);
    return mesh;
  };
  const reserved=[...Object.values(NARRATIVE_POINTS),...Array.from({length:6},(_,i)=>bookPoint(i))].filter(p=>p.floor===floor.index&&p.top!=null);
  const prop = (parent, kind, x, z, w, h, d, color, finish = 'plain', offset = 0, role = null) => {
    const y = parent.max[1] + offset;
    // Props stay strictly inside the existing supporting footprint.
    if (x - w / 2 < parent.min[0] + .015 || x + w / 2 > parent.max[0] - .015 || z - d / 2 < parent.min[2] + .015 || z + d / 2 > parent.max[2] - .015) return;
    if(role && reserved.some(p=>Math.abs(p.top-parent.max[1])<.25 && Math.hypot(Math.max(x-w/2-p.x,0,p.x-x-w/2),Math.max(z-d/2-p.z,0,p.z-z-d/2))<.27))return;
    if(role && offset && !supports.some(s=>s.sourceBox===boxes.indexOf(parent) && Math.abs(s.bounds.maxY-y)<1e-7 && s.bounds.minX<x+w/2 && s.bounds.maxX>x-w/2 && s.bounds.minZ<z+d/2 && s.bounds.maxZ>z-d/2))return;
    if(role==='shelf-book' && boxes.some(b=>b!==parent && x+w/2>b.min[0] && x-w/2<b.max[0] && z+d/2>b.min[2] && z-d/2<b.max[2] && y+h>b.min[1]+.001 && y<b.max[1]-.001))return;
    add(kind, [x, y + h / 2, z], [w, h, d], color, finish);
    const bounds = { minX: x-w/2, maxX: x+w/2, minY: y, maxY: y+h, minZ: z-d/2, maxZ: z+d/2 };
    supports.push({ sourceBox: boxes.indexOf(parent), role, decorative:!!role, surfaceY: y, parentSurfaceY: parent.max[1], offset, parent: { minX: parent.min[0], maxX: parent.max[0], minZ: parent.min[2], maxZ: parent.max[2] }, bounds });
    stats.details++;
    if (!role && h >= .18 && w >= .1 && d >= .1) colliders.push({ ...bounds, minY: bounds.minY + floor.baseY, maxY: bounds.maxY + floor.baseY, kind: 'furniture-detail' });
  };
  try {
    const decorated = new Set();
    const paper='#eee9dd', blue='#2d5fa8', dark='#5b616b';
    // Small original props borrow the same primitives, material cache and batcher.
    const notebook=(b,x,z,color)=>{
      prop(b,'box',x,z,.23,.025,.29,color,'plain',0,'notebook');
      prop(b,'box',x,z,.205,.012,.265,paper,'plain',.025,'pages');
      prop(b,'box',x+.13,z-.06,.016,.016,.19,dark,'plain',0,'pencil');
    };
    const bottle=(b,x,z)=>{
      prop(b,'cylinder',x,z,.065,.13,.065,blue,'plain',0,'bottle');
      prop(b,'cylinder',x,z,.045,.02,.045,dark,'plain',.13,'bottle-cap');
    };

    for (const b of boxes) {
      const [w,h,d] = b.size, [x,,z] = b.center;
      const top = h < .16 && Math.min(w,d) > .3;
      const back = d < .09 && w > .45 && h > .3 && h < .8;
      const woodColors = new Set(['#8b6a4e', '#c49b70', '#a98262', '#7a5a3d', '#b57f59', '#684534', '#c0a17a']);
      const metalColors = new Set(['#5b616b', '#586b68', '#737982']);
      const finish = woodColors.has(b.color) ? 'wood' : metalColors.has(b.color) ? 'metal' : ['#2d5fa8','#2f5d9a'].includes(b.color)?'plastic':'plain';
      if((top&&b.max[1]>.4&&b.max[1]<1.4)||back||(floor.index===2&&h>.8&&w>1&&d>.4)){
        const a=b.min,c=b.max,v=back?[[a[0]+.008,a[1]+.008,c[2]+.003],[c[0]-.008,a[1]+.008,c[2]+.003],[c[0]-.008,c[1]-.008,c[2]+.003],[a[0]+.008,c[1]-.008,c[2]+.003]]:[[a[0]+.008,c[1]+.003,a[2]+.008],[c[0]-.008,c[1]+.003,a[2]+.008],[c[0]-.008,c[1]+.003,c[2]-.008],[a[0]+.008,c[1]+.003,c[2]-.008]];
        for(let i=0;i<4;i++)edgePositions.push(...v[i],...v[(i+1)%4]);
      }
      if (floor.index === 2 && h > .8 && w > 1 && d > .4) {
        add('rounded', [x,b.max[1]-.06,z], [w,.12,d], b.color, 'wood');
        for (const dx of [-1,1]) for (const dz of [-1,1]) {
          add('box', [x+dx*(w/2-.065),b.min[1]+(h-.12)/2,z+dz*(d/2-.065)], [.08,h-.12,.08], '#5b616b','metal');
        }
        stats.roundedFaces++;
      } else {
        add(top || back ? 'rounded' : 'box', b.center, b.size, b.color, finish);
        if (top || back) stats.roundedFaces++;
      }
      const room = floor.rooms.find(r => x > r.x1 && x < r.x2 && z > r.z1 && z < r.z2);
      if (!room) continue;
      // Existing book volumes receive readable pale page blocks within their bounds.
      if (room.type === 'library' && w > .16 && w < .26 && h > .25 && h < .36 && d > .12 && d < .22) {
        add('box', [x, b.center[1], b.max[2] + .002], [w*.72,h*.8,.004], '#eee9dd'); stats.details++;
      }
      if(room.type==='library' && top && d>2 && w<.7 && b.max[1]<2) {
        // Existing shelves remain partially filled. Occupied source book volumes are skipped.
        for(let j=0;j<9;j++){
          const height=[.24,.30,.34][(j+Math.round(b.max[1]*10))%3], depth=[.09,.12,.14][j%3];
          prop(b,'box',x,b.min[2]+.20+j*.28,.22,height,depth,[blue,'#8b6a4e',paper][j%3],'plain',0,'shelf-book');
        }
      }
      if(room.type==='class' && top && w>.75 && d>.5 && b.max[1]>.65 && b.max[1]<1.25) {
        const variant=(Math.round((x-room.x1)*7)+Math.round((z-room.z1)*5))%4;
        notebook(b,x-.12,z-.015,variant%2?blue:'#8b6a4e');
        bottle(b,x+.35,z+.18);
        if(variant===1)prop(b,'rounded',x+.20,z,.17,.045,.065,dark,'cloth',0,'pencil-case');
        if(variant===2)prop(b,'box',x+.20,z,.18,.016,.22,paper,'plain',0,'worksheet');
        continue;
      }
      if(room.type==='library' && top && w>1.2 && d>.65 && b.max[1]>.65 && b.max[1]<1.25){
        // Keep the six interactive books and puzzle staging clear at the center.
        notebook(b,b.min[0]+.22,b.max[2]-.19,'#8b6a4e');
        prop(b,'box',b.min[0]+.22,b.max[2]-.19,.025,.006,.12,blue,'plain',.037,'bookmark');
        const lx=b.max[0]-.22,lz=b.max[2]-.15;
        prop(b,'box',lx,lz,.16,.025,.14,dark,'plain',0,'lamp-base');
        prop(b,'box',lx,lz,.035,.18,.035,dark,'plain',.025,'lamp-stem');
        prop(b,'rounded',lx,lz,.22,.07,.16,paper,'plain',.205,'lamp-shade');
        continue;
      }
      if (!top || w < .75 || d < .5 || b.max[1] < .65 || b.max[1] > 1.25 || decorated.has(room.id)) continue;
      decorated.add(room.id);
      if (['secretaria','office','reception','lab'].includes(room.type)) {
        prop(b,'box',x,z-.08,.32,.018,.14,dark,'plain');
        prop(b,'box',x,z+.13,.18,.025,.13,dark);
        prop(b,'box',x,z+.13,.045,.14,.045,dark,'metal',.025);
        prop(b,'box',x,z+.13,.3,.2,.035,blue,'plain',.165);
      } else if (room.type === 'science') {
        prop(b,'cylinder',x-.16,z,.065,.14,.065,blue,'glass');
        prop(b,'cylinder',x+.16,z,.055,.2,.055,paper,'glass');
        prop(b,'cylinder',x-.16,z,.045,.025,.045,dark,'metal',.14);
        prop(b,'cylinder',x+.16,z,.04,.025,.04,dark,'metal',.2);
        prop(b,'box',x,z+.16,.16,.025,.13,dark);
        prop(b,'box',x,z+.16,.035,.17,.04,dark,'metal',.025);
        prop(b,'box',x,z+.16,.12,.06,.08,paper,'plain',.195);
      } else if (room.type === 'teachers') {
        prop(b,'cylinder',x-.16,z,.075,.1,.075,paper);
        prop(b,'box',x+.12,z,.23,.025,.29,blue);
        prop(b,'box',x+.12,z,.2,.018,.26,paper,'plain',.025);
      } else {
        const count = room.type === 'library' ? 6 : 1;
        for (let j=0;j<count;j++) {
          const bx = x + (j-(count-1)/2) * Math.min(.11,(w-.1)/count);
          prop(b,'box',bx,z,count===6?.085:.24,.025,count===6?.22:.3,blue);
          prop(b,'box',bx,z,count===6?.07:.215,.012,count===6?.2:.28,paper,'plain',.025);
        }
      }
    }
    batchMeshes(group, [...group.children], owned);
    stats.meshCount = group.children.length;
    for (const mesh of group.children) stats.triangles += (mesh.geometry.index?.count ?? mesh.geometry.attributes.position.count) / 3;
  } catch (error) {
    owned.forEach(g => g.dispose()); group.clear(); throw error;
  }
  if(edgePositions.length){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(edgePositions,3));const material=new THREE.LineBasicMaterial({color:COLORBEAT_STYLE.ink,transparent:true,opacity:COLORBEAT_STYLE.environmentInkOpacity,depthWrite:false});edges=new THREE.LineSegments(geometry,material);edges.name='Colorbeat selective furniture ink';group.add(edges);owned.push(geometry,material);}
  stats.outlineSegments=edgePositions.length/6;
  const originalVisible = source.visible; source.visible = false;
  let disposed = false;
  return { group, supports, colliders, stats, edges, updateQuality(quality){if(edges)edges.visible=quality!=='low';}, dispose() { if (disposed) return; disposed = true; group.removeFromParent(); group.clear(); owned.forEach(g => g.dispose()); source.visible = originalVisible; } };
}
