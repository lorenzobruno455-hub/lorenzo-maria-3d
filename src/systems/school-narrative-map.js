// Coordinates of fictional gameplay staging, never real-school measurements.
const point=(floor,x,z,name,top=null,approach=null)=>({floor,x,z,name,...(top===null?{}:{top}),...(approach?{approach}: {})});
export const NARRATIVE_POINTS={
 classroom:point(0,-4.7,16,'Sala de história · adaptação'),
 'study-notebook':point(0,-3.65,17.45,'Caderno de estudos',.81,{x:-4.5,z:16.5}),
 'classroom-photo':point(0,-3,17.45,'Fotografia cenográfica',.81,{x:-4,z:16.5}),
 'school-exercise':point(0,-6.5,13.22,'Atividade de história',.78,{x:-5.5,z:12.8}),
 'shelf-clue':point(0,-6.5,-16.5,'Pista entre as estantes',.83,{x:-6.5,z:-15.3}),
 'shelf-puzzle':point(0,-6.5,-16.5,'Organizar as três lombadas',.83,{x:-6.5,z:-15.3}),
 'lost-book':point(0,-5.7,-16.8,'Livro de Bia',.79,{x:-5.7,z:-15.3}),
 score:point(2,9,-7,'Partitura do ensaio',.9,{x:7.8,z:-7}),
 instrument:point(2,9,0,'Teclado do ensaio · salão',.9,{x:7.8,z:0}),
 'music-rhythm':point(2,9,0,'Ensaio com Davi',.9,{x:7.8,z:0}),
 notebook:point(0,-6.5,13.22,'Caderno de literatura',.78,{x:-5.5,z:12.8}),
 card:point(0,-7.35,-16.8,'Cartão da biblioteca',.79,{x:-7.35,z:-15.3}),
 photo:point(2,-9,-7,'Fotografia do jardim · ponto de leitura',.9,{x:-7.8,z:-7}),
 album:point(0,-6.8,-16.8,'Álbum de memórias',.79,{x:-6.5,z:-15.3}),
 mem:point(0,-7.35,-16.2,'Memória de vocês',.79,{x:-7.35,z:-15.3}),
 quiz:point(1,-4.45,-10.2,'Quiz · sala de ciências',.925,{x:-5.2,z:-10}),
 rit:point(2,8.65,-7,'No compasso do coração',.9,{x:7.8,z:-7}),
 'memory-1':point(0,-9.65,15.04,'Leitura: Quando a gente começou',.78,{x:-8.5,z:15.04}),
 'memory-2':point(2,-9,0,'Leitura: Se fomos babau',.9,{x:-7.8,z:0}),
 'memory-3':point(2,-9,7,'Leitura: Um dos dias mais importantes',.9,{x:-7.8,z:7}),
 'memory-4':point(2,9,7,'Leitura: O meu primeiro beijo',.9,{x:7.8,z:7}),
 'memory-5':point(1,9.65,10.45,'Leitura: O último dia (que não foi)',.81,{x:8.5,z:10.45}),
 'memory-6':point(0,-5.7,-16.2,'Leitura: Finalmente',.79,{x:-5.7,z:-15.3}),
 'science-book':point(1,-8.9,-10,'Livro de física',.925,{x:-7.7,z:-10}),
 'music-headphones':point(2,9.35,-7,'Fones de ouvido',.9,{x:7.8,z:-7}),
 'garden-letter':point(1,9.65,17.45,'Carta do jardim · leitura',.81,{x:8.5,z:17.45}),
 'reflection-seat':point(0,-6.5,12.5,'Cadeira de reflexão',.4825,{x:-5.5,z:12.5}),
 moon:point(2,-9.35,7,'Pequena lua',.9,{x:-7.8,z:7}),
 canteen:point(0,4.3,-12.3,'Lanches virtuais · ponto de encontro',.81,{x:5.5,z:-12.3}),
 note:point(0,9.65,10.45,'Bilhete da turma',.81,{x:8.5,z:10.45}),
 ball:point(2,0,12,'Bola do salão',.03),
};
const route=(floor,points)=>({floor,start:{floor,x:points[0][0],z:points[0][1]},route:points.map(([x,z,state='observe'])=>({floor,x,z,state,duration:9}))});
export const ACTOR_ROUTES={
 maria:route(0,[[-4.7,16],[-5.2,16.5]]),
 bia:route(0,[[-4,-14],[-4,-12.8]]),
 helena:route(1,[[-6,-13.5],[-6,-11.8]]),
 davi:route(2,[[6,0],[6,-4]]),
 caio:route(2,[[0,10],[2,12]]),
 lia:route(0,[[5.5,-13.5],[7,-13.5]]),
};
export function bookPoint(index){return point(0,-7.3+index*.32,-11.7,`Livro ${index+1}`, .79,{x:-7.3+index*.32,z:-12.7});}
export const sameFloor=(point,floor)=>Number.isInteger(point?.floor)&&point.floor===floor;
export function narrativeWaypoint(navigation,floor,target){
 if(!target||sameFloor(target,floor))return target;
 const destination=target.floor>floor?floor+1:floor-1;
 const stair=navigation.targets(floor).find(s=>s.destination===destination);
 return stair?{...stair,kind:'school-stair',floor,name:`${stair.label} · objetivo no ${target.floor+1}º andar`}:null;
}

export function narrativePriority(kind){return {adventure:3,item:1.25,memory:1.5,'memory-book':1}[kind]||0;}
