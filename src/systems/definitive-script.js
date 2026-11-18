import {buildCinematicScene,CINEMATIC_DIRECTIONS} from './cinematic-direction.js';
import {CinematicPresentation} from './cinematic-presentation.js';
import corpus from '../data/definitive-script.json' with {type:'json'};
import {SCRIPT_CHOICES,sceneStops,SCENE_PUZZLES,MISSION_SCENES} from '../data/script-staging.js';
import {groupScenes,startScript,completeScene} from './script-progress.js';
import {chapters,memories,currentChapter,nextStep,questEvent,unlockMemory} from './quests.js';
import {narrativeWaypoint} from './school-narrative-map.js';

export const SPEAKERS={lorenzo:'LORENZO',maria:'MARIA',bia:'RAFAELLA',caio:'PORVA',helena:'PROF NEWMARA',davi:'BASSARAB',lia:'HELÔ',narrator:'NARRAÇÃO',radio:'RÁDIO'};
export const sourceLabel=kind=>({real_report:'Relato do autor · resposta recordada',documentary_summary:'Resumo documental',adapted:'Cena dramatizada · falas recriadas',fictional:'Ficção narrativa · não é registro histórico',pending_verification:'Ficção documental · contexto histórico pendente'})[kind]||'';
export const scriptLines=ids=>ids.flatMap(id=>corpus.scenes.find(s=>s.id===id)?.lines||[]).map(l=>({...l,speaker:SPEAKERS[l.speakerId],provenance:l.sourceKind}));
const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
const button=(text,action)=>{const b=node('button',text);b.onclick=action;return b;};

/** Thin scene adapter: existing modal, interaction registry, cutscene manager and save. */
export class DefinitiveScript{
 constructor({story,adventure,expansion,school,living,world,scene,getProgress,save,notify}){
  Object.assign(this,{story,adventure,expansion,school,living,world,scene,getProgress,save,notify});
  story.script=this;living.script=this;adventure.script=this;expansion.script=this;
  this.cinematicUI=new CinematicPresentation();
  this.onFinish=adventure.cutscenes.onFinish;
  adventure.cutscenes.onFinish=event=>{
   if(event.id.startsWith('script:')){this.cinematicUI.hide();if(['complete','skipped'].includes(event.reason))this.afterDialogue(event.id.slice(7));else notify('Cena interrompida. Retome pelo objetivo ou pelo menu do roteiro.');}
   else this.onFinish?.(event);
  };
  this.marker=world.resources.mesh('box','#22eced',[.27,.06,.2]);this.marker.userData.inkDynamic=true;this.marker.visible=false;scene.add(this.marker);
  // Lightweight original Chromebook, active only at its existing classroom desk.
  this.computer=world.resources.mesh('box','#13182b',[.44,.025,.3]);
  const screen=world.resources.mesh('box','#1d2c48',[.44,.28,.025]);screen.position.set(0,.15,-.13);this.computer.add(screen);
  const display=world.resources.mesh('box','#26dce6',[.38,.22,.005]);display.position.set(0,.15,-.112);this.computer.add(display);this.computer.visible=false;scene.add(this.computer);
  this.reconcile();
 }
 get state(){return this.getProgress().script;}
 get current(){const a=this.state.active;return a?groupScenes(a.group)[a.index]:null;}
 stops(){const s=this.current;if(!s)return[];const done=this.state.collected[s.id]||[];return sceneStops(s.id).filter(p=>!done.includes(p.stopId));}
 start(group,replay=false){
  if(this.journey)return this.journey.openScript(group,replay);
  if(this.state.active){this.story.close();this.story.start();this.notify('Roteiro retomado · siga o objetivo.');return false;}
  const p=this.getProgress(),n=Number(group.split('-')[1]);
  if(group.startsWith('chapter-')&&(p.stage<2||n>p.campaign.memories.length+1)){this.notify('Conclua o prólogo e o capítulo anterior.');return false;}
  if(group==='epilogue'&&(!p.expansion.quests.archive?.completed||p.campaign.memories.length!==6)){this.notify('Restaure o Arquivo Aurora após as seis memórias.');return false;}
  if(this.expansion.current||this.adventure.current&&!(this.adventure.current.id==='first-encounter'&&this.adventure.current.step.target==='first-finale')){this.notify('Conclua a aventura ativa antes de iniciar este capítulo.');return false;}
  if(group==='chapter-1'&&!replay&&p.adventure.quests['first-encounter'].status==='available'){this.adventure.start('first-encounter');return true;}
  if(!startScript(this.state,group,replay))return false;
  for(const s of groupScenes(group)){delete this.state.collected[s.id];delete this.state.puzzles[s.id];}
  this.living.setMode('campaign');this.story.close();this.story.start();this.save();this.notify(this.current.title);return true;
 }
 targets(){if(this.journey&&this.current&&!this.journey.allowed('script',this.state.active.group))return[];const s=this.current;if(!s||this.school.inspecting||this.adventure.cutscenes.active)return[];const p=this.stops()[0];if(!p)return[];
  if(p.outside?this.school.active:!this.school.active||p.floor!==this.school.floor)return[];
  return[{...p,x:(p.approach||p).x,z:(p.approach||p).z,id:`script:${s.id}`,kind:'script',height:(p.outside?0:this.school.navigation.floor(p.floor).baseY)+(p.top??.8)+.25,name:`${s.title} · ${p.name}`}];
 }
 goal(){const s=this.current,p=this.stops()[0];if(!s||!p)return null;const target={...p,name:`${s.title} · ${p.name}`};
  if(p.outside&&!this.school.active)return target;
  if(p.outside)return narrativeWaypoint(this.school.navigation,this.school.floor,{floor:0,x:10,z:-5.5,name:`${s.title} · saia a pé para o jardim`});
  if(!this.school.active)return{...this.school.connection.access.gates.find(g=>g.id==='reception'),name:`${s.title} · entre na recepção a pé`};
  return narrativeWaypoint(this.school.navigation,this.school.floor,target);
 }
 handle(target){if(target.kind!=='script')return false;const s=this.current;if(!s||target.id!==`script:${s.id}`)return true;
  const done=this.state.collected[s.id]||[];
  if(done.length){this.collectStop(s.id);return true;}
  if(CINEMATIC_DIRECTIONS[s.id]||scriptLines([s.id]).some(line=>this.adventure.cutscenes.actors[line.speakerId])){
   const p=this.stops()[0],y=p.outside?this.world.groundHeight(p.x,p.z):this.school.navigation.floor(p.floor).walkY;
   const manager=this.adventure.cutscenes,camera=this.adventure.camera;
   const scene=buildCinematicScene(s.id,scriptLines([s.id]),{
    camera,actors:manager.actors,stageCast:true,title:s.title,point:{...p,y},
    toLocal:point=>camera.parent?camera.parent.worldToLocal(point):point,
    obstacles:()=>this.school.active?this.school.cameraObstacles():this.world.occluders,
    onBeat:event=>{this.cinematicUI.beat(event);if(event.index===0&&event.direction.mode==='object')this.adventure.audio.play('object');},
    onEnd:direction=>{if(direction.bell)this.adventure.audio.play('bell');},
   });
   this.cinematicUI.show(CINEMATIC_DIRECTIONS[s.id]||{mode:'conversation',object:s.title});
   manager.play(scene);
   document.getElementById('scene-pause').textContent='Pausar cena';
   document.getElementById('scene-title').textContent=s.title;document.getElementById('scene-subtitle').textContent=sourceLabel(s.sourceKind)+' · cena pulável';
  }else this.story.dialogue.start(scriptLines([s.id]),{done:()=>this.afterDialogue(s.id)});
  return true;
 }
 afterDialogue(id){if(this.current?.id!==id)return;const options=SCRIPT_CHOICES[id];
  if(options){this.story.dialogue.start([{speaker:'ESCOLHA',speakerId:'narrator',text:id==='EP-CENA01'?'A última página está em branco. Escolha seu título.':'Como continuar?',provenance:'fictional'}],{instant:true,choices:options.map(([value,label,speakerId,text])=>({label,action:()=>{
   this.state.choices[id]=value;if(id==='EP-CENA01')this.state.endingTitle=value;this.save();
   const finish=()=>this.completeInteraction(id);
   if(text)this.story.dialogue.start([{speaker:SPEAKERS[speakerId],speakerId,text,provenance:'adapted'}],{done:finish});else finish();
  }}))});this.story.dialogue.advance();return;}
  this.completeInteraction(id);
 }
 completeInteraction(id){if(this.current?.id!==id)return;
  if(SCENE_PUZZLES[id]&&!this.state.puzzles[id]?.includes('complete')){this.openReflection();return;}
  if(id==='CAP04-CENA02'&&!this.state.puzzles[id]?.includes('complete')){this.adventure.activity('music-rhythm');this.awaitRhythm=id;return;}
  this.collectStop(id);
 }
 collectStop(id){if(this.current?.id!==id)return;const p=this.stops()[0];if(!p)return;this.state.collected[id]||=[];this.state.collected[id].push(p.stopId);if(this.stops().length){this.save();this.notify(this.stops()[0].name);return;}this.finish(id);}
 completeChapter(group,replay=false){
  if(!group.startsWith('chapter-')||replay)return false;const memory=memories.find(m=>m.quest===group),c=this.getProgress().campaign;let changed=false;
  if(memory&&currentChapter(c)?.id===group){while(nextStep(c)&&nextStep(c).type!=='memory')questEvent(c,nextStep(c).type);changed=unlockMemory(c,memory.id);if(changed){const special=group==='chapter-2'?'garden-letter':group==='chapter-5'?'flowers':null;if(special&&!c.special.includes(special))c.special.push(special);}this.story.changed();}
  if(group==='chapter-1'&&this.adventure.current?.id==='first-encounter'&&this.adventure.current.step.target==='first-finale')this.adventure.director.emit('scene','first-finale');
  return changed;
 }
 reconcile(){
  this.recovering=true;let changed=false;
  try{
   if(this.current&&!this.stops().length){this.finish(this.current.id);changed=true;}
   // Older V1 saves could contain the completed scene receipt before its reward.
   while(!this.state.active){const chapter=currentChapter(this.getProgress().campaign);if(!chapter||!groupScenes(chapter.id).every(s=>this.state.completed.includes(s.id)))break;if(!this.completeChapter(chapter.id))break;changed=true;}
   if(changed)this.save();
  }finally{this.recovering=false;}
 }
 finish(id){const a=this.state.active;if(!a||this.current?.id!==id)return;const group=a.group,replay=a.replay;
  completeScene(this.state,id);
  if(this.state.active){this.save();this.notify(this.current.title);return;}
  // Commit scene, canonical memory and reward together before the first write.
  DefinitiveScript.prototype.completeChapter.call(this,group,replay);
  if(group==='epilogue'&&!replay)this.living.setMode('free');if(replay&&this.journey){this.journey.endReview();return;}this.save();
  this.notify(group==='epilogue'?'A próxima página · exploração livre disponível.':'Página guardada · capítulo concluído.');
  if(group==='prologue'&&!replay&&!this.recovering&&this.getProgress().stage===2&&this.getProgress().adventure.quests['first-encounter'].status==='available')this.adventure.start('first-encounter');
 }
 openReflection(message=''){
  const s=this.current,p=SCENE_PUZZLES[s.id];this.story.show('script-puzzle');document.getElementById('story-title').textContent=s.title;
  this.state.puzzles[s.id]||=[...p.cards].reverse();const order=this.state.puzzles[s.id];let selected=null;
  const status=node('p',message||'Selecione dois cartões para trocar.');status.setAttribute('role','status');this.story.content.append(status);
  const grid=node('div');grid.className='expansion-grid';order.forEach((text,i)=>{const b=button(`${i+1}. ${text}`,()=>{if(selected===null){selected=i;b.setAttribute('aria-pressed','true');return;}[order[selected],order[i]]=[order[i],order[selected]];this.save();this.openReflection('Troca salva.');});b.dataset.scriptCard=text;grid.append(b);});
  this.story.content.append(grid,button('Dica',()=>status.textContent=p.hint),button('Conferir sequência',()=>{if(!order.every((v,i)=>v===p.cards[i])){status.textContent='Observe a pista e tente novamente.';return;}this.state.puzzles[s.id]=['complete'];this.story.close();this.collectStop(s.id);}));this.save();
 }
 update(){
  const t=this.targets()[0],p=this.stops()[0];this.marker.visible=!!t;this.computer.visible=!!t&&p.model==='computer';
  if(t){const parent=p.outside?this.scene:this.school.group;if(this.marker.parent!==parent)parent.add(this.marker);this.marker.position.set(p.x,(p.outside?0:this.school.navigation.floor(p.floor).baseY)+(p.top??.03)+.04,p.z);
   if(this.computer.visible){if(this.computer.parent!==parent)parent.add(this.computer);this.computer.position.copy(this.marker.position);this.marker.visible=false;}}
  if(this.awaitRhythm&&this.story.page!=='adventure-activity'&&!this.story.open){this.awaitRhythm=null;}
 }
 rhythmComplete(){const id=this.awaitRhythm;if(!id||this.current?.id!==id)return false;this.awaitRhythm=null;this.state.puzzles[id]=['complete'];this.collectStop(id);return true;}
 readBook(id,origin){const book=corpus.books.find(b=>b.memoryId===id);if(!book)return;const index=memories.findIndex(m=>m.id===id);if(origin)this.story.focus={x:origin.x,z:origin.z,y:(origin.height||1.1)+.4,distance:1.8,yaw:0,pitch:.65,hidePlayer:true};this.story.dialogue.start([{speaker:'BIBLIOTECA DAS MEMÓRIAS',speakerId:'narrator',text:`${memories[index].date} · ${book.title}`,provenance:index===0?'adapted':'pending_verification'},{speaker:'NARRAÇÃO',speakerId:'narrator',text:book.text,provenance:index===0?'adapted':'pending_verification'}]);}
 talkCategory(category){const list=this.freeConversations('maria'),last=this.getProgress().campaign.lastDialogue[category],pool=list.filter(c=>c.id!==last);const chosen=(pool.length?pool:list)[Math.floor(Math.random()*(pool.length||list.length))];if(!chosen){this.notify('Esta conversa estará disponível depois da fase correspondente da história.');return;}this.story.dialogue.start(chosen.lines.map(l=>({...l,speaker:SPEAKERS[l.speakerId],provenance:l.sourceKind})),{done:()=>{const c=this.getProgress().campaign;c.lastDialogue[category]=chosen.id;c.talks+=chosen.lines.length;if(!this.journey&&nextStep(c)?.type==='talk')questEvent(c,'talk');this.story.changed();}});}
 missionLines(id,step){return scriptLines(MISSION_SCENES[`${id}:${step}`]||[]);}
 freeConversations(id){return corpus.conversations.filter(c=>c.lines.some(l=>l.speakerId===id)&&this.conversationAvailable(c));}
 conversationAvailable(c){const p=this.getProgress(),cond=c.condition;return cond.includes('livre')||cond.includes('fase escolar')&&(this.state.completed.includes('CAP01-CENA10')||p.campaign.memories.length>=1)||cond.includes('fase posterior')&&(this.state.completed.includes('CAP01-CENA11')||p.campaign.memories.length>=1)||cond==='epílogo'&&this.state.completed.includes('EP-CENA02')||cond==='fim do jogo'&&this.state.completed.includes('EP-CENA02')||cond.includes('após memória 6')&&p.campaign.memories.length===6||cond.includes('após CAP03')&&p.campaign.memories.includes('memory-3')||cond.includes('após plano')&&p.expansion.quests.plan?.completed||cond.includes('durante AV05')&&p.expansion.active==='letter'||cond.includes('antes AV02')&&p.adventure.quests['lost-book'].status!=='completed'||cond.includes('após AV02')&&p.adventure.quests['lost-book'].status==='completed'||cond.includes('após AV03')&&p.adventure.quests['familiar-music'].status==='completed'||cond.includes('após AV06')&&p.expansion.quests.frequency?.completed;}
 conversationOptions(id){return this.freeConversations(id).map(c=>({label:`Conversa · ${c.id}`,action:()=>this.story.dialogue.start(c.lines.map(l=>({...l,speaker:SPEAKERS[l.speakerId],provenance:l.sourceKind})),{done:()=>{this.getProgress().living.decisions[`script:${c.id}`]='heard';this.save();}})}));}
 renderPage(content,page){if(page==='menu'&&!this.journey)content.prepend(button('Roteiro definitivo · capítulos e epílogo',()=>this.show()));
  if(page==='chapters')for(const c of chapters)content.append(button(`${this.getProgress().campaign.memories.includes(`memory-${chapters.indexOf(c)+1}`)?'Rever':'Jogar'} roteiro: ${c.title}`,()=>this.start(c.id,this.getProgress().campaign.memories.includes(`memory-${chapters.indexOf(c)+1}`))));
  if(page==='album'){if(this.state.endingTitle)content.append(node('h3',`DIÁRIO DE BORDO · ${this.state.endingTitle}`));for(const entry of corpus.album){const flags={'ALB-INTRO':'PRO-CENA01','ALB-2023':'CAP01-CENA02','ALB-0607':'CAP01-CENA05','ALB-1908':'CAP01-CENA09','ALB-2008':'CAP01-CENA10','ALB-2025':'CAP02-CENA04','ALB-730':'EP-CENA01','ALB-FINAL':'EP-CENA01'};const allowed=this.state.completed.includes(flags[entry.id]);if(allowed)content.append(node('p',entry.text));}if(this.getProgress().expansion.quests.archive?.completed)content.append(button('Rever epílogo · A próxima página',()=>this.start('epilogue',true)));}
 }
 show(){if(this.journey&&!this.journey.developer)return this.journey.missions();this.story.show('script');document.getElementById('story-title').textContent='Roteiro definitivo · Diário de Bordo';const c=this.story.content;
  c.append(node('p','Cenas dramatizadas e ficção são identificadas. As datas históricas são preservadas; capítulos com lacunas permanecem em revisão.'));
  if(this.current)c.append(node('h3',`Em andamento: ${this.current.title}`),button('Retomar roteiro',()=>{this.story.close();this.story.start();}));
  c.append(button('Prólogo · Uma página em branco',()=>this.start('prologue',this.state.completed.includes('PRO-CENA01'))));
  for(const chapter of chapters){const n=chapters.indexOf(chapter),b=button(`${chapter.date} · ${chapter.title}`,()=>this.start(chapter.id,this.getProgress().campaign.memories.includes(`memory-${n+1}`)));b.disabled=this.getProgress().stage<2||n>this.getProgress().campaign.memories.length;c.append(b);}
  const ep=button('Epílogo · A página que falta',()=>this.start('epilogue',this.state.completed.includes('EP-CENA01')));ep.disabled=!this.getProgress().expansion.quests.archive?.completed||this.getProgress().campaign.memories.length!==6;c.append(ep);
 }
 dispose(){this.cinematicUI.dispose();this.marker.removeFromParent();this.computer.removeFromParent();this.adventure.cutscenes.onFinish=this.onFinish;this.story.script=null;this.living.script=null;this.adventure.script=null;this.expansion.script=null;}
}
