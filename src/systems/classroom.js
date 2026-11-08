import * as THREE from 'three';

// Original metric classroom dressing. Static geometry is batched by createWorld.
// Floor is y=.12, inner walls x[-27.75,-6.25], z[-16.75,-6.25].
export function createClassroomDetails(scene,resources) {
  const colliders=[],maps=[],materials=[],objects=[];
  let disposed=false;
  const metrics={desks:6,posters:0,windows:5};
  const ink='#202b43',wood='#b99b70',paper='#dbdbcf',teal='#557b73';
  const mesh=(kind,color,scale,pos,material='plain')=>{const m=resources.mesh(kind,color,scale,material);m.position.set(...pos);scene.add(m);objects.push(m);return m;};
  const box=(c,s,p,kind)=>mesh('box',c,s,p,kind);
  const cylinder=(c,s,p)=>mesh('cylinder',c,s,p);
  const solid=(x,z,w,h,d)=>colliders.push({minX:x-w/2,maxX:x+w/2,minY:.12,maxY:.12+h,minZ:z-d/2,maxZ:z+d/2,enabled:true});
  const label=(text,sub,x,y,z,w,h,angle=0,bg=ink)=>{
    const c=document.createElement('canvas');c.width=768;c.height=384;const ctx=c.getContext('2d');
    const draw=()=>{ctx.fillStyle=bg;ctx.fillRect(0,0,768,384);ctx.strokeStyle='#ffd43b';ctx.lineWidth=6;ctx.strokeRect(18,18,732,348);ctx.fillStyle='#fff5dc';ctx.font='700 62px "Barlow Condensed",sans-serif';ctx.textAlign='center';ctx.fillText(text,384,155,690);ctx.font='28px "Atkinson Hyperlegible",sans-serif';ctx.fillText(sub,384,227,690);};draw();
    const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;maps.push(map);
    document.fonts?.ready.then(()=>{if(!disposed){draw();map.needsUpdate=true;}});
    const material=new THREE.MeshBasicMaterial({map});materials.push(material);
    const m=new THREE.Mesh(resources.geometry('box'),material);m.scale.set(w,h,.018);m.position.set(x,y,z);m.rotation.y=angle;scene.add(m);objects.push(m);return m;
  };
  // Robust wall rails, color bands and baseboards separate surfaces at eye level.
  for(const x of [-27.70,-6.30]){box(teal,[.06,.96,10.3],[x,.60,-11.5]);box(wood,[.07,.055,10.3],[x,1.10,-11.5]);box(ink,[.08,.10,10.3],[x,.17,-11.5]);}
  box(teal,[20.9,.95,.06],[-17,.60,-16.70]);box(ink,[20.9,.10,.08],[-17,.17,-16.68]);
  // Teaching wall is solid, perpendicular to the windows; no board over glass.
  box(wood,[.10,1.78,5.5],[-27.60,2.22,-11.5],'wood');
  box('#31564a',[.12,1.60,5.30],[-27.52,2.22,-11.5]);
  label('LITERATURA · 2º ANO','Histórias que a gente constrói',-27.445,2.34,-11.5,4.8,1.15,Math.PI/2,'#175d68');
  box(wood,[.29,.055,5.4],[-27.40,1.30,-11.5],'wood');
  box(paper,[.05,.035,.15],[-27.31,1.35,-10.9]);box(ink,[.08,.04,.23],[-27.31,1.35,-12.3]);
  // Detailed cupboard, grounded with plinth; leaves central entrance clear.
  const cx=-8.1,cz=-15.9;solid(cx,cz,2.5,2.35,1.1);
  box(wood,[2.5,2.28,1.1],[cx,1.30,cz],'wood');box(ink,[2.48,.10,1.08],[cx,.17,cz]);
  for(const dx of [-.61,.61]){box(teal,[1.16,2.05,.035],[cx+dx,1.31,cz+.567]);box('#b8b0a0',[.035,.14,.05],[cx+dx+(dx<0?.43:-.43),1.34,cz+.60],'metal');}
  box(ink,[2.36,.035,.04],[cx,2.35,cz+.58]);
  // Window reveals, sills, two cloth pleats and simple pelmets. No wind shader.
  for(const x of [-25,-21,-17,-13,-9]) {
    box(paper,[2.7,.12,.26],[x,1.48,-16.48]);
    for(const dx of [-1.27,1.27])box(paper,[.07,2.45,.19],[x+dx,2.72,-16.54]);
    cylinder(ink,[.018,2.85,.018],[x,3.98,-16.38]).rotation.z=Math.PI/2;
    for(const side of [-1,1])for(let fold=0;fold<3;fold++)box(fold%2?teal:'#62867a',[.09,1.95,.07],[x+side*(1.0+fold*.08),2.79,-16.30+fold%2*.045],'cloth');
    box('#d49c4b',[.28,.06,.09],[x-1.08,2.13,-16.24]);box('#d49c4b',[.28,.06,.09],[x+1.08,2.13,-16.24]);
  }
  // Floor bags sit next to tables, clear of chair seating and interaction targets.
  for(const [x,z]of [[-23.9,-12.7],[-10.0,-8.9]]){
    box(ink,[.36,.06,.24],[x,.15,z]);box(teal,[.35,.43,.23],[x,.365,z],'cloth');box('#62867a',[.26,.22,.035],[x,.29,z+.13],'cloth');box('#ffd43b',[.025,.02,.04],[x+.08,.40,z+.16]);
    for(const dx of [-.11,.11])box(ink,[.03,.37,.025],[x+dx,.37,z-.13]);
    box(ink,[.20,.025,.03],[x,.60,z]);for(const dx of [-.10,.10])box(ink,[.025,.08,.03],[x+dx,.57,z]);
  }
  // Teacher wall storage and a sideboard with real support geometry.
  const sx=-26.75,sz=-8.0;solid(sx,sz,1.0,.95,1.6);
  box(wood,[1,.85,1.6],[sx,.595,sz],'wood');box(ink,[.96,.10,1.55],[sx,.17,sz]);
  for(const z of [-8.45,-7.65]){box(teal,[.025,.68,.70],[-26.235,.60,z]);box(ink,[.045,.04,.16],[-26.20,.65,z]);}
  box(paper,[.75,.075,1.15],[sx,1.06,sz]);box('#d49c4b',[.73,.012,1.14],[sx,1.105,sz]);
  // Fan cage is drawn as sparse, shared straight members; no per-frame work.
  for(const x of [-23,-12]){
    cylinder(ink,[.025,.38,.025],[x,4.65,-11.5]);cylinder(paper,[.12,.13,.12],[x,4.41,-11.5]);
    for(let i=0;i<3;i++){const a=i*Math.PI*2/3,m=box('#62867a',[.85,.035,.17],[x+Math.cos(a)*.38,4.35,-11.5+Math.sin(a)*.38]);m.rotation.y=-a;}
  }
  for(const [text,sub,x,z]of [['NOSSA TURMA','Cada voz faz parte da história',-22.5,-6.30],['LEIA · IMAGINE','Biblioteca aberta no intervalo',-10.9,-6.30],['FEIRA DE CIÊNCIAS','Perguntar também é descobrir',-6.32,-9.4]]){
    label(text,sub,x,2.35,z,2.15,1.25,x===-6.32?-Math.PI/2:Math.PI);metrics.posters++;
  }
  return {colliders,metrics,objects,dispose(){if(disposed)return;disposed=true;maps.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());}};
}
