// Original procedural Aurora scenery, released as CC0. No downloaded assets.
export function addLibraryDetails(place) {
 const wood='#b99b70',dark='#8d6e52',paper='#eee8db';
 for(const z of [-14,-10,-7.5]) {
  place('box',dark,[.08,2.8,2.2],27.55,1.52,z);
  for(const dz of [-1.08,1.08])place('box',wood,[.52,2.8,.08],27.3,1.52,z+dz);
  for(let row=0;row<4;row++) {
   const y=.2+row*.67;place('box',wood,[.58,.07,2.2],27.3,y,z);
   for(let i=0;i<10;i++) {
    const h=.34+(i%4)*.055,bz=z-.94+i*.2;
    const book=place('box',['#836457','#6b8179','#8b7b91'][i%3],[.34,h,.145],27.22,y+.04+h/2,bz);
    book.rotation.x=i===8?-.11:0;
    for(const dy of [-h*.32,h*.32])place('box',paper,[.008,.018,.12],27.045,y+.04+h/2+dy,bz);
   }
  }
  place('box',wood,[.62,.1,2.3],27.3,2.94,z);
 }
 place('box','#6b8179',[5.4,.012,4.5],17,.132,-11.2);
 for(const x of [14.35,19.65])place('box',wood,[.025,.014,4.4],x,.143,-11.2);
 for(const x of [11,17,23])for(const z of [-13,-9]) {
  for(let i=0;i<3;i++) {
   place('box',i%2?'#6b8179':'#836457',[.5,.045,.37],x+.75,1.025+i*.055,z+.15);
   place('box',paper,[.46,.025,.34],x+.75,1.052+i*.055,z+.15);
  }
  place('cylinder',paper,[.13,.018,.13],x-.8,1.43,z);
 }
 for(const x of [10.5,17,23.5]) {
  for(const dx of [-.5,.5])place('box',dark,[.025,1.01,.025],x+dx,4.495,-11.5);
  place('box',dark,[1.6,.08,.55],x,3.95,-11.5);
  place('box',paper,[1.35,.025,.38],x,3.9,-11.5);
 }
}
export function addGardenDetails(mesh) {
 const box=(color,s,x,y,z)=>mesh('box',color,s,x,y,z);
 for(const x of [-10,10]) {
  for(const z of [2.5,7.5])box('#eadfc8',[4.15,.12,.12],x,.53,z);
  for(const dx of [-2,2])box('#eadfc8',[.12,.12,5.1],x+dx,.53,5);
  for(let i=0;i<15;i++) {
   const fx=x-1.65+(i%5)*.81,fz=3+Math.floor(i/5)*1.85;
   mesh('leaf','#698756',[.28,.18,.35],fx,.65,fz);
   mesh('sphere',['#b69059','#ca8d63','#b0a16d'][i%3],[.095,.055,.095],fx,.84,fz);
  }
  for(const dx of [-1.5,1.5])for(const z of [12.65,13.2])box('#eadfc8',[.045,.015,.045],x+dx,.77,z);
 }
 for(const cx of [-17,17])for(const dx of [-8,-4,4,8]) {
  box('#557b73',[2.9,.09,.18],cx+dx,3.45,-5.7);
  for(const side of [-1,1])box('#eadfc8',[.07,1.9,.09],cx+dx+side*1.4,2.4,-5.7);
 }
 for(let i=0;i<5;i++) {
  const x=-3+i*1.5;
  box('#eadfc8',[.8,.035,.55],x,1.4425,-24.4);
  mesh('cylinder','#557b73',[.1,.18,.1],x+.22,1.55,-24.55);
  box('#eadfc8',[.08,.025,6.8],x,3.72,-22);
 }
 for(const x of [-34.5,-31.5])box('#eee8db',[.045,.012,2.2],x,.052,.35);
 box('#eee8db',[3,.012,.045],-33,.052,1.45);
 for(const x of [-33.4,-32.6])box('#657e77',[.04,.4,.025],x,2.75,-.325);
 for(const y of [2.55,2.95])box('#657e77',[.84,.04,.025],-33,y,-.325);
}
