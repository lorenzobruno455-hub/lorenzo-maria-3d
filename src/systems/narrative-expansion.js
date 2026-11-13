import * as THREE from 'three';
import {EXPANSION,PUZZLES,FICTION,LETTER,SYMBOLS,missionById} from '../data/expansion.js';
import {NARRATIVE_POINTS, narrativeWaypoint} from './school-narrative-map.js';
import {memories} from './quests.js';
import {currentExpansion,startExpansion,advanceExpansion,setPuzzleOrder,shuffledOrder,finishExpansion,rewardExpansion} from './expansion-progress.js';
import '../expansion.css';
const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
const button=(text,action)=>{const b=node('button',text);b.type='button';b.onclick=action;return b;};
const at=(key,name,offset=0)=>({...NARRATIVE_POINTS[key],x:NARRATIVE_POINTS[key].x+offset,name});
export const EXPANSION_POINTS={
 'plan-notebook':at('study-notebook','Examinar Caderno dos Planos',.45),
 'plan-pages-a':at('school-exercise','Páginas · Preparação'),
 'plan-pages-b':at('shelf-clue','Páginas · Logística e Coragem',.45),
 'plan-pages-c':{floor:0,x:0,z:-8,name:'Páginas · Conversa',top:.04},
 'letter-envelope':at('album','Envelope fictício · biblioteca',-.8),
 'letter-fragment-1':at('shelf-clue','Livro com fragmento da carta',-.35),
 'letter-mural':{floor:0,x:0,z:-4,name:'Marcador ilustrado · corredor',top:.04},
 'letter-fragment-2':{floor:0,x:0,z:-4,name:'Fragmento do marcador',top:.04},
 'letter-fragment-3':at('school-exercise','Pasta com fragmento da carta',.4),
 'letter-fragment-4':{outside:true,x:12,z:23,name:'Caixa de leitura · jardim do campus',top:.03},
 'letter-box':{outside:true,x:12,z:23,name:'Compartimento de papel · jardim',top:.03},
 'letter-fragment-5':{outside:true,x:12,z:23,name:'Último fragmento · jardim',top:.03},

};

/** Adapts existing Story/Adventure systems; no second save, player or frame loop. */
export class NarrativeExpansion {
 constructor({school,world,scene,story,adventure,living,character,getProgress,save,notify,audio,effects}){
  Object.assign(this,{school,world,scene,story,adventure,living,character,getProgress,save,notify,audio,effects});
  this.props=new Map();this.sceneAnimation=null;this.selected=null;
  this.onSceneFinish=adventure.cutscenes.onFinish;
  adventure.cutscenes.onFinish=event=>{
   if(event.id.startsWith('expansion-')){
    const id=event.id.slice('expansion-'.length);if(this.sceneAnimation?.mesh)this.sceneAnimation.mesh.rotation.z=this.sceneAnimation.base;this.sceneAnimation=null;
    if(['complete','skipped'].includes(event.reason)&&finishExpansion(this.state,id))this.reward(id);
   }else this.onSceneFinish?.(event);
  };
  story.expansion=this;
  for(const m of EXPANSION)if(rewardExpansion(this.state,getProgress().campaign,m.id))save();
 }
 get state(){return this.getProgress().expansion;}
 get current(){return currentExpansion(this.state);}
 point(id){
  if(['maria','bia','davi'].includes(id))return this.school.active?this.school.narrative.actorPoint(id):null;
  if(id.startsWith('archive-symbol-')){
   const i=Number(id.split('-').at(-1))-1;
   return this.school.active?{...NARRATIVE_POINTS[`memory-${i+1}`],name:`Símbolo ${SYMBOLS[i]} · ${memories[i].title}`}:{...memories[i].position,floor:null,top:.05,name:`Símbolo ${SYMBOLS[i]} · ${memories[i].title}`};
  }
  const p=EXPANSION_POINTS[id];if(!p||p.outside===true&&this.school.active||p.outside!==true&&!this.school.active)return null;return p;
 }
 rawTargets(){const c=this.current;if(c)return c.task.type==='collect'?c.task.targets.filter(id=>!c.quest.collected.includes(id)):[c.task.target];return EXPANSION.filter(m=>!this.state.quests[m.id]?.completed&&(!m.requiresMemories||this.getProgress().campaign.memories.length===6)).map(m=>m.tasks[0].target);}
 ensureProp(id,p){
  if(['maria','bia','davi'].includes(id))return null;
  const key=`${this.school.active?'school':'campus'}:${id}`;
  if(!this.props.has(key)){
   const group=new THREE.Group(),r=this.world.resources;
   const shell=r.mesh('box','#101426',[.5,.07,.34]),pages=r.mesh('box','#fff5dc',[.44,.025,.28]),cover=r.mesh('box',id.includes('radio')?'#28e7ef':id.includes('letter')?'#ff5b96':'#ffdc31',[.49,.018,.33]);
   pages.position.y=.045;cover.position.y=.065;group.add(shell,pages,cover);
   group.userData.cover=cover;group.name=`Aurora ficção · ${id}`;group.userData.inkDynamic=true;
   (this.school.active?this.school.group:this.scene).add(group);
   group.position.set(p.x,(this.school.active?this.school.navigation.floor(p.floor).baseY:0)+(p.top??.05)+.06,p.z);
   this.props.set(key,group);
  }
  return this.props.get(key);
 }
 targets(){
  if(this.school.inspecting||this.adventure.current)return[];
  return this.rawTargets().map(id=>{const p=this.point(id);if(!p||this.school.active&&p.floor!==this.school.floor)return null;
   const mesh=this.ensureProp(id,p);return{...p,id,kind:'expansion',mesh:mesh||undefined,height:(this.school.active?this.school.navigation.floor(p.floor).baseY:0)+(p.top??1.3)+.2};
  }).filter(Boolean);
 }
 goal(){
  const c=this.current;if(!c)return null;const ids=c.task.type==='collect'?c.task.targets.filter(id=>!c.quest.collected.includes(id)):[c.task.target];
  let p=ids.map(id=>this.point(id)).filter(Boolean).sort((a,b)=>Math.abs((a.floor??0)-this.school.floor)-Math.abs((b.floor??0)-this.school.floor))[0];
  if(!p){return this.school.active?narrativeWaypoint(this.school.navigation,this.school.floor,{floor:0,x:10,z:-5.5,name:`${c.mission.title} · saia a pé para o jardim do campus`}):{...this.school.connection.access?.gates.find(g=>g.id==='reception')||this.school.connection.door?.position||{x:49,z:5.5},name:`${c.mission.title} · entre no São Jorge a pé`};}
  p={...p,name:`${c.mission.title} · ${c.task.title}${c.task.type==='collect'?` (${c.task.targets.filter(id=>c.quest.collected.includes(id)).length}/${c.task.targets.length})`:''}`};
  return this.school.active?narrativeWaypoint(this.school.navigation,this.school.floor,p):p;
 }
 start(id){
  if(this.adventure.current){this.notify('Conclua a aventura em andamento antes de iniciar a expansão.');return false;}
  if(!startExpansion(this.state,id,this.getProgress().campaign)){this.notify('Arquivo Aurora requer as seis memórias históricas. Outra missão ativa deve ser concluída primeiro.');return false;}
  this.story.close();this.story.start();this.save();this.notify(`${missionById(id).title} · siga o objetivo no HUD`);return true;
 }
 handle(target){
  if(target.kind!=='expansion')return false;
  if(!this.current){const m=EXPANSION.find(m=>m.tasks[0].target===target.id);if(!m||!this.start(m.id))return true;}
  const c=this.current,t=c.task;
  if(!(t.targets||[t.target]).includes(target.id))return false;
  if(t.type==='puzzle'){this.openPuzzle();return true;}
  if(t.type==='scene'){this.playScene(c.mission.id);return true;}
  const done=choice=>{if(advanceExpansion(this.state,target.id,{choice})){this.save();this.audio.play(t.type==='collect'?'collect':'confirm');this.notify(this.current?.task.title||'Objetivo concluído');}};
  this.character.requestAction(t.type==='collect'?'pickup':'openbook',{duration:.85});
  if(t.type==='talk'){
   const actor=this.living.actors.find(a=>a.definition.id===target.id);this.living.speakingId=target.id;actor?.character.requestAction('talk',{duration:1.5});
   this.story.dialogue.start([{speaker:target.id.toUpperCase(),text:t.text,provenance:'school-fiction'}],{instant:true,choices:t.choices.map(choice=>({label:choice,action:()=>done(choice)}))});
  }else{
   this.adventure.actions.play(t.type==='collect'&&!this.school.active?'pickup':'book',target.mesh,()=>{
    this.story.dialogue.start([{speaker:'DESCOBERTA FICTÍCIA',text:`${t.text||target.name} ${FICTION}`,provenance:'school-fiction'}],{instant:true,done:()=>done()});
   });
  }
  return true;
 }
 show(){
  this.story.show('expansion');document.getElementById('story-title').textContent='Aventuras · Expansão narrativa';
  const content=this.story.content;content.append(node('p',FICTION));
  for(const m of EXPANSION){const q=this.state.quests[m.id],card=node('article');card.className='story-card';card.append(node('h3',m.title),node('p',q?.completed?'✓ Concluída':q?m.tasks[q.step].title:'Explore, encontre pistas e resolva os puzzles.'));
   if(q?.completed){card.append(node('p',`★ ${m.achievement} · ${m.item}`),button('Rever conclusão',()=>this.replay(m.id)));if(m.id==='letter')card.append(button('Ler carta fictícia',()=>this.showLetter()));}
   else{const b=button(q?'Retomar missão':'Iniciar missão',()=>this.start(m.id));b.disabled=!!(m.requiresMemories&&this.getProgress().campaign.memories.length!==6||this.state.active&&this.state.active!==m.id);b.dataset.mission=m.id;card.append(b);if(m.requiresMemories)card.append(node('small',`Requer seis memórias históricas · ${this.getProgress().campaign.memories.length}/6`));}
   if(q&&Object.keys(q.choices).length)card.append(node('p',`Escolhas: ${Object.values(q.choices).join(' · ')}`));content.append(card);
  }
 }
 openPuzzle(message=''){
  const c=this.current;if(c?.task.type!=='puzzle')return;
  const id=c.task.puzzle,p=PUZZLES[id];
  if(!c.quest.puzzles[id]){setPuzzleOrder(this.state,id,shuffledOrder(id));this.save();}
  this.story.show('expansion-puzzle');document.getElementById('story-title').textContent=c.mission.title;
  const content=this.story.content;content.classList.add('expansion-content');content.append(node('p',FICTION),node('h3',c.task.title),node('p',c.task.text||'Selecione dois cartões para trocar. A posição e suas trocas são salvas automaticamente.'));
  const status=node('p',message||'Toque em um cartão e depois em outro.');status.setAttribute('role','status');status.className='expansion-feedback';content.append(status);
  const grid=node('div');grid.className='expansion-grid';this.selected=null;
  c.quest.puzzles[id].forEach((cardId,i)=>{
   const card=p.cards.find(card=>card.id===cardId),b=button(`${i+1}. ${card.block?`${card.block} · `:''}${card.label}`,()=>{
    if(this.selected===null){this.selected=i;b.setAttribute('aria-pressed','true');status.textContent=`Cartão ${i+1} selecionado. Toque no destino.`;return;}
    const order=[...c.quest.puzzles[id]];[order[this.selected],order[i]]=[order[i],order[this.selected]];setPuzzleOrder(this.state,id,order);this.save();this.openPuzzle('Posições trocadas e salvas.');
   });b.dataset.puzzleCard=cardId;b.dataset.slot=i;b.setAttribute('aria-pressed','false');grid.append(b);
  });content.append(grid);
  if(id==='association')content.append(node('p',memories.map((m,i)=>`${i+1}. ${m.date} · ${m.title}`).join(' | ')));
  if(id==='tuning')content.append(node('p','Sintonia simbólica: LorenzoFM, MariaFM e LorenzoeMariaFM permanecem livres no mini player. Nenhum MP3 é necessário para este puzzle.'));
  content.append(button('Dica',()=>{status.textContent=p.hint;}),button('Tentar novamente',()=>{setPuzzleOrder(this.state,id,shuffledOrder(id));this.save();this.openPuzzle('Nova disposição. As pistas continuam disponíveis.');}),button('Conferir sequência',()=>{
   if(!advanceExpansion(this.state,c.task.target,{puzzle:id})){status.textContent='A sequência ainda não combina. Use a dica, troque os cartões e tente novamente.';this.audio.play('object');return;}
   this.story.close();this.save();this.audio.play('confirm');this.character.requestAction('react',{duration:1.2});this.effects.burst('SINTONIA!');this.notify(this.current.task.title);
  }));
 }
 reward(id){if(rewardExpansion(this.state,this.getProgress().campaign,id)){this.notify(`★ ${missionById(id).achievement} · ${missionById(id).item}`);this.audio.play('quest');}this.save();}
 playScene(id,replay=false){
  const m=missionById(id),p=this.point(m.tasks.at(-1).target);
  if(!p||this.school.active&&p.floor!==this.school.floor){this.notify('Volte ao local de conclusão indicado no diário para rever a cena.');return false;}
  this.story.close();this.story.start();const y=(this.school.active?this.school.navigation.floor(p.floor).baseY:0)+(p.top??.1);
  const mesh=this.ensureProp(m.tasks.at(-1).target,p);this.sceneAnimation={mesh,base:mesh?.rotation.z||0,time:0};
  this.adventure.cutscenes.play({id:`expansion-${id}`,shots:[
   {duration:1.4,camera:{from:[p.x+1.8,y+1.5,p.z+2],to:[p.x+1.1,y+1.1,p.z+1.5],lookAt:[p.x,y+.15,p.z]},actors:[{id:'lorenzo',state:'observe'}],effect:'PÁGINAS VIVAS'},
   {duration:1.4,actors:[{id:'lorenzo',state:'react'}],dialogue:{speaker:'EPÍLOGO FICTÍCIO',text:`${m.finale} ${FICTION}`,provenance:'school-fiction'}},
  ]});
  document.getElementById('scene-title').textContent=m.title;document.getElementById('scene-subtitle').textContent=`${replay?'Revisão · ':''}Ficção narrativa · cena pulável`;
  return true;
 }
 replay(id){if(!this.state.quests[id]?.completed)return;this.playScene(id,true);}
 showLetter(){this.story.show('expansion-letter');document.getElementById('story-title').textContent='Uma Carta Nunca Entregue · ficção';const text=node('p',LETTER.join('\n\n'));text.className='letter-text';this.story.content.append(node('p',FICTION),text);}
 mariaOptions(){return this.state.quests.plan?.completed?[{label:'Sobre o caderno dos planos',action:()=>this.story.dialogue.start([{speaker:'MARIA',text:'O melhor plano ainda é prestar atenção na resposta. Vamos deixar o caderno descansar? '+FICTION,provenance:'school-fiction'}],{instant:true})}]:[];}
 renderPage(content,page){
  if(page!=='expansion-puzzle')content.classList.remove('expansion-content');
  if(page==='menu')content.prepend(button('Expansão narrativa · quatro missões',()=>this.show()));
  if(page==='inventory')for(const m of EXPANSION)if(this.state.quests[m.id]?.completed)content.append(node('p',`◆ ${m.item} · ficção narrativa`));
  if(page==='album')for(const m of EXPANSION)if(this.state.quests[m.id]?.completed){const card=node('article');card.className='story-card';card.append(node('h3',m.title),node('p',FICTION),button(m.id==='letter'?'Ler carta fictícia':'Rever conclusão',()=>m.id==='letter'?this.showLetter():this.replay(m.id)));content.append(card);}
 }
 update(dt){
  const visible=new Set(this.targets().map(t=>t.mesh).filter(Boolean));
  for(const mesh of this.props.values())mesh.visible=visible.has(mesh)||this.sceneAnimation?.mesh===mesh;
  if(this.sceneAnimation){this.sceneAnimation.time+=dt;const a=this.sceneAnimation;if(a.mesh)a.mesh.rotation.z=a.base+Math.sin(a.time*5)*.08;}
 }
 dispose(){this.sceneAnimation=null;this.adventure.cutscenes.onFinish=this.onSceneFinish;for(const mesh of this.props.values())mesh.removeFromParent();this.props.clear();this.story.expansion=null;}
}
