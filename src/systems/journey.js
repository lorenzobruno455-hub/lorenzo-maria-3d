import {legacyQuestOwns} from './narrative-identity.js';
import {NARRATIVE_POINTS,narrativeWaypoint} from './school-narrative-map.js';
import {JOURNEY,currentJourney,journeyDone,canStartJourney,reconcileJourney} from './journey-progress.js';
import {chapters,memories} from './quests.js';
import {groupScenes,validateScript} from './script-progress.js';
import {SPEAKERS,scriptLines} from './definitive-script.js';
import {EXPANSION,LETTER} from '../data/expansion.js';
import {NPC_DATA,EVENT_DATA} from './social.js';
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const button=(label,fn)=>{const n=el('button',label);n.onclick=fn;return n;};
export const cleanObjective=text=>String(text||'').replace(/^Roteiro · /,'').replace(/ · aventura\b/gi,'').replace(/expansão narrativa/gi,'história');
/** Presentation and ownership adapter. Existing engines still execute every task. */
export class Journey {
 constructor({story,adventure,expansion,script,living,getProgress,save,notify}){
  Object.assign(this,{story,adventure,expansion,script,living,getProgress,save,notify});
  for(const system of [story,adventure,expansion,script,living])system.journey=this;
  document.getElementById('new-campaign').onclick=()=>{this.panel('Recomeçar a história');this.story.newCampaign();};
  this.originalStart=document.getElementById('start').onclick;
  document.getElementById('start').onclick=()=>this.resume();document.getElementById('start').textContent='CONTINUAR';
  document.getElementById('welcome-free').onclick=()=>this.explore();
  this.reconcile();
 }
 get developer(){return import.meta.env?.DEV&&new URLSearchParams(location.search).has('devtools');}
 developerPanel(){if(!this.developer)return;const c=this.panel('Ferramentas de desenvolvimento');for(const [title,fn]of [['Capítulos',()=>this.script.show()],['Aventuras',()=>this.adventure.show()],['Missões',()=>this.expansion.show()]])c.append(button(title,fn));}
 get p(){return this.getProgress();}get current(){return currentJourney(this.p);}
 allowed(system,key){return canStartJourney(this.p,system,key);}
 reconcile(){this.p.adventure=this.adventure.director.state;if(reconcileJourney(this.p))this.save();}
 openScript(group,replay=false){
  if(replay)return this.review(group);
  if(!this.allowed('script',group))return false;
  if(this.script.state.active)return this.script.state.active.group===group;
  const old=this.p.journey.suspendedScript[group],scenes=groupScenes(group),index=scenes.findIndex(s=>!this.script.state.completed.includes(s.id));
  this.script.state.active=old?{...old,replay:false}:{group,index:Math.max(0,index),replay:false};delete this.p.journey.suspendedScript[group];
  this.save();return true;
 }
 activate(){this.reconcile();const m=this.current;if(!m)return;
  if(m.system==='script')this.openScript(m.key);
  if(m.system==='adventure'){
   if(legacyQuestOwns(this.p,m.key))return;
   if(m.id==='first'&&this.adventure.director.state.quests[m.key].status==='completed')this.openScript('chapter-1');
   else if(!this.adventure.current)this.adventure.start(m.key);
  }
  if(m.system==='expansion'&&!this.expansion.current)this.expansion.start(m.key);
 }
 review(group){
  const n=Number(group.split('-')[1]);const completed=group.startsWith('chapter-')?this.p.campaign.memories.includes(`memory-${n}`):groupScenes(group).length&&groupScenes(group).every(s=>this.p.script.completed.includes(s.id));
  if(!completed)return false;
  if(this.p.journey.review){if(this.p.journey.review.group===group&&this.p.script.active?.group===group){this.story.close();this.originalStart();this.story.start();return true;}this.endReview();}
  const fromWelcome=!document.getElementById('welcome').hidden;this.story.close();this.originalStart();
  this.p.journey.review={group,mode:fromWelcome||this.living.free?'free':'campaign',snapshot:validateScript(this.p.script)};this.reconcile();
  this.p.script.active={group,index:0,replay:true};for(const s of groupScenes(group)){delete this.p.script.collected[s.id];delete this.p.script.puzzles[s.id];}
  this.story.close();this.story.start();this.save();return true;
 }
 endReview(){const r=this.p.journey.review;if(!r)return;this.p.script=validateScript(r.snapshot);delete this.p.journey.review;if(this.p.script.active)delete this.p.journey.suspendedScript[this.p.script.active.group];this.p.living.mode=r.mode;this.save();}
 resume(){if(this.p.journey.review)this.endReview();this.originalStart();this.living.setMode('campaign');this.story.close();this.story.start();this.activate();}
 explore(){if(this.p.journey.review)this.endReview();this.originalStart();this.living.setMode('free');this.reconcile();this.story.close();this.story.start();this.notify('Exploração livre · CONTINUAR retoma a história.');}
 update(dt,{started,blocked}){if(!started||blocked||this.living.free||this.p.journey.review)return;this.clock=(this.clock||0)+dt;if(this.clock<.25)return;this.clock=0;this.activate();}
 panel(title){this.story.show('journey-panel');this.story.content.dataset.journeyPage='';document.getElementById('story-title').textContent=title;this.story.content.classList.add('journey-content');return this.story.content;}
 show(page){
  if(page==='menu'){this.menu();return true;}
  if(['chapters','script','expansion','adventures'].includes(page)&&this.developer)return false;
  if(['missions','chapters','script','expansion','adventures'].includes(page)){this.missions();return true;}
  if(page==='album'){this.album();return true;}
  if(page==='settings'){this.settings();return true;}
  return false;
 }
 settings(){this.story.close();this.story.start();document.getElementById('pause-button').click();}
 menu(){const c=this.panel('Nossa história');c.dataset.journeyPage='menu';c.append(el('p','Uma história, um próximo passo.','journey-intro'));
  for(const [title,fn]of [['CONTINUAR',()=>this.resume()],['MISSÕES',()=>this.missions()],['ÁLBUM',()=>this.album()],['EXPLORAR',()=>this.explore()],['CONFIGURAÇÕES',()=>this.settings()]])c.append(button(title,fn));
 }
 goal(){if(this.p.journey.review){const g=this.script.goal();return g?{...g,name:`Revisita · ${cleanObjective(g.name)}`}:null;}const m=this.current;if(!m)return null;let g;
  if(m.system==='adventure'&&legacyQuestOwns(this.p,m.key)){
   const event=EVENT_DATA.find(e=>e.id===m.key),school=this.script.school;
   if(this.p.living.events[m.key]==='found'){const a=this.living.actors.find(a=>a.definition.id===event.npc);return{...a.agent.position,id:event.npc,name:`${m.title} · Volte a ${a.definition.name}`};}
   const point=NARRATIVE_POINTS[m.key==='lost-book'?'lost-book':'score'];
   return school.active?narrativeWaypoint(school.navigation,school.floor,{...point,name:event.description}):{...school.connection.access.gates.find(g=>g.id==='reception'),name:`${m.title} · Entre no São Jorge`};
  }
  if(m.system==='script')g=this.script.goal();else if(m.system==='adventure')g=this.script.current?.id.startsWith('CAP01')?this.script.goal():this.adventure.goal();else if(m.system==='expansion')g=this.expansion.goal();
  if(g)return{...g,name:cleanObjective(g.name)};
  return null;
 }
 summary(){const m=this.current,g=this.goal();let done=0,total=1;
  if(m?.system==='script'){const scenes=groupScenes(m.key);total=scenes.length;done=scenes.filter(s=>this.p.script.completed.includes(s.id)).length;}
  else if(m?.system==='adventure'){const q=this.adventure.current;if(q){total=q.definition.steps.length;done=q.node;}}
  else if(m?.system==='expansion'){const q=this.expansion.current;if(q){total=q.mission.tasks.length;done=q.quest.step;}}
  else if(m?.system==='tutorial'){total=3;done=this.p.collected.length;}
  const objective=g?.name||(m?.id==='tutorial'?(this.p.stage===0?'Converse com Maria para começar.':this.p.collected.length<3?'Encontre as três lembranças e volte a Maria.':'Converse com Maria para guardar as lembranças.'):'Selecione CONTINUAR para retomar o próximo objetivo.');
  return {mission:m?.title||'Nossa história continua',objective,done,total,index:m?JOURNEY.indexOf(m):-1,location:g?.outside?'Jardim do campus':Number.isInteger(g?.floor)?`${g.floor+1}º pavimento · São Jorge`:g?'Siga a indicação no mapa':'Campus e São Jorge'};
 }
 missions(){const c=this.panel('Missões'),s=this.summary(),m=this.current;
  if(m){const card=el('article',undefined,'story-card journey-current');card.append(el('small','MISSÃO ATUAL'),el('h3',s.mission),el('p',s.objective),el('p',`${s.done}/${s.total} objetivos · ${s.location}`),button('LOCALIZAR OBJETIVO',()=>{this.resume();this.story.tracked=this.goal();}));c.append(card);}else c.append(el('p','A história principal foi concluída. O álbum e os encontros continuam disponíveis.'));
  c.append(el('h3','Sua jornada'));
  for(const step of JOURNEY){const done=journeyDone(this.p,step),current=step===m;const card=el('article',undefined,'story-card journey-row');card.append(el('strong',done?`✓ ${step.title}`:current?`▶ ${step.title}`:'🔒 Próxima missão'),el('small',done?'Concluída':current?'Em andamento':'Continue a história para descobrir.'));c.append(card);}
 }
 album(category='memories'){const c=this.panel('Álbum'),nav=el('nav',undefined,'journey-tabs');nav.setAttribute('aria-label','Categorias do álbum');
  for(const [id,title]of [['memories','MEMÓRIAS'],['documents','CARTAS E DOCUMENTOS'],['extras','EXTRAS']]){const b=button(title,()=>this.album(id));b.dataset.albumCategory=id;b.setAttribute('aria-pressed',String(id===category));nav.append(b);}c.append(nav);
  if(category==='memories')for(const m of memories){const unlocked=this.p.campaign.memories.includes(m.id),card=el('article',undefined,'story-card');card.append(el('small',m.date),el('h3',m.title),el('p',unlocked?'✓ Guardada no álbum':'🔒 Continue a história para descobrir.'));if(unlocked)card.append(button('LER LEMBRANÇA',()=>{this.story.close();this.script.readBook(m.id);}),button('REVISITAR CAPÍTULO',()=>this.review(m.quest)));c.append(card);}
  if(category==='documents'){
   this.script.renderPage(c,'album');
   for(const m of memories)if(this.p.campaign.memories.includes(m.id))c.append(button(`Livro · ${m.title}`,()=>{this.story.close();this.script.readBook(m.id);}));
   if(this.p.campaign.letter)c.append(button('Carta final',()=>this.story.show('letter')));
   const letter=this.p.expansion.quests.letter,letterMission=EXPANSION.find(m=>m.id==='letter');if(letter)for(let i=0;i<LETTER.length;i++){const at=letterMission.tasks.findIndex(t=>t.target===`letter-fragment-${i+1}`);if(at>=0&&letter.step>at)c.append(el('h3',`Fragmento ${i+1}`),el('p',LETTER[i],'letter-text'));}
   if(this.p.expansion.quests.letter?.completed)c.append(button('Uma Carta Nunca Entregue',()=>this.expansion.showLetter()));
   for(const [id,title]of [['notebook','Caderno de literatura'],['card','Cartão da biblioteca'],['photo','Fotografia do jardim']])if(this.p.collected.includes(id))c.append(el('p',title));
   if(!this.p.campaign.memories.length&&!this.p.collected.length)c.append(el('p','Os documentos encontrados aparecerão aqui.'));
  }
  if(category==='extras'){
   for(const [title,page]of [['Inventário e recompensas','inventory'],['Conquistas','achievements'],['Atividades da escola','games'],['Conversas guardadas','history'],['Encontros e amizades','campus']])c.append(button(title,()=>this.story.show(page)));
   for(const def of this.adventure.director.definitions)if(this.p.adventure.quests[def.id]?.status==='completed')c.append(button(`Rever · ${def.title}`,()=>this.adventure.replay(def.id)));
   for(const event of EVENT_DATA.filter(e=>['lost-book','familiar-music'].includes(e.id)&&this.p.living.events[e.id]==='done'&&this.p.adventure.quests[e.id]?.status!=='completed'))c.append(button(`Relembrar encontro · ${event.title}`,()=>{this.story.close();this.living.finishEvent(event,{replay:true});}));
   c.append(button('Dupla Dinâmica',()=>{if(!this.p.campaign.special.includes('duo'))this.p.campaign.special.push('duo');this.story.changed();this.story.close();this.story.dialogue.start([{speaker:'SISTEMA',text:'COMBO: Dupla Dinâmica! Lorenzo +100 de felicidade. Maria +100 de paciência. Duração: indefinida.',provenance:'creative-fiction'}]);}));
   this.expansion.renderPage(c,'album');
  }
 }
 maria(){this.living.speakingId='maria';this.story.dialogue.start([{speaker:'MARIA',text:'Sobre o que vamos conversar?',provenance:'creative-fiction'}],{instant:true,choices:[
  {label:'CONVERSAR SOBRE A HISTÓRIA',action:()=>this.historyTalk('maria')},
  {label:'CONVERSAR NORMALMENTE',action:()=>this.casual('maria')},
  {label:'DESPEDIR-SE',action:()=>this.story.dialogue.close(false)},
 ]});this.story.dialogue.advance();this.story.dialogue.root.dataset.mariaMenu='true';}
 historyTalk(id){
  this.living.speakingId=id;
  if(this.living.free&&!this.p.journey.review){this.story.dialogue.start([{speaker:SPEAKERS[id]||'MARIA',text:'Selecione CONTINUAR para retomar o próximo passo da história.',provenance:'creative-fiction'}]);return;}
  if(this.current?.id==='tutorial'&&id==='maria'){this.story.tutorial();return;}
  const legacy=this.current?.system==='adventure'&&legacyQuestOwns(this.p,this.current.key)?EVENT_DATA.find(e=>e.id===this.current.key):null;
  if(legacy?.npc===id){if(this.p.living.events[legacy.id]==='found')this.living.finishEvent(legacy);else this.living.say(id,[{speaker:SPEAKERS[id],text:legacy.description,provenance:'school-fiction'}]);return;}
  const a=this.adventure.current;if(a?.step?.target===id&&['talk','deliver'].includes(a.step.type)){this.adventure.handle({...this.adventure.target(),id});return;}
  const e=this.expansion.current;if(e?.task?.target===id&&e.task.type==='talk'){this.expansion.handle({id,kind:'expansion'});return;}
  const s=this.script.current,t=this.script.targets()[0];
  if(s&&t&&s.lines.some(l=>l.speakerId===id)&&Math.hypot(t.x-this.story.player.position.x,t.z-this.story.player.position.z)<2.6){this.script.handle(t);return;}
  this.story.dialogue.start([{speaker:SPEAKERS[id]||'MARIA',text:'O próximo passo está indicado no seu objetivo. Podemos continuar de lá.',provenance:'creative-fiction'}]);
 }
 async casual(id){
  const last=this.p.campaign.lastDialogue[`casual:${id}`],list=this.script.freeConversations(id),pool=list.filter(c=>c.id!==last);
  if(list.length){const chosen=(pool.length?pool:list)[Math.floor(Math.random()*(pool.length||list.length))];this.living.speakingId=id;this.story.dialogue.start(chosen.lines.map(l=>({...l,speaker:SPEAKERS[l.speakerId],provenance:l.sourceKind})),{done:()=>{this.p.campaign.lastDialogue[`casual:${id}`]=chosen.id;this.p.campaign.talks+=chosen.lines.length;this.save();}});return;}
  if(id!=='maria'){const npc=NPC_DATA.find(n=>n.id===id);this.living.say(id,[{speaker:npc.name.toUpperCase(),text:npc.lines[1],provenance:'school-fiction'}]);return;}
  const token=this.casualToken=(this.casualToken||0)+1;this.story.dialogueData||=(await import('../data/dialogues.json')).default;if(this.casualToken!==token||this.story.dialogue.open)return;
  const allowed=this.p.campaign.memories.length?['cotidianas','humor','escola','música','filosofia','fé']:['cotidianas','humor','escola'];
  const rows=this.story.dialogueData.filter(d=>d.source==='MM'&&allowed.includes(d.category)),options=rows.filter(d=>d.id!==last),chosen=(options.length?options:rows)[Math.floor(Math.random()*(options.length||rows.length))];if(!chosen)return;
  this.living.say('maria',[chosen],{done:()=>{this.p.campaign.lastDialogue['casual:maria']=chosen.id;this.p.campaign.talks++;this.save();}});
 }
 npc(id){const npc=NPC_DATA.find(n=>n.id===id);if(!npc)return;const choices=[{label:'Conversar',action:()=>this.casual(id)}];
  if(this.adventure.current?.step.target===id||this.expansion.current?.task.target===id||this.current?.system==='adventure'&&legacyQuestOwns(this.p,this.current.key)&&EVENT_DATA.find(e=>e.id===this.current.key)?.npc===id)choices.unshift({label:'Sobre a nossa missão',action:()=>this.historyTalk(id)});
  if(id==='helena')choices.push({label:'Uma pergunta de ciências',action:()=>this.p.living.events['physics-question']?this.living.physicsQuestion():this.living.beginEvent(EVENT_DATA.find(e=>e.id==='physics-question'))});
  if(id==='lia')choices.push({label:'Ver cardápio',action:()=>this.living.canteen()});
  if(this.p.living.reputation[id]>=2)choices.push({label:'Conversa de amizade',action:()=>this.living.friendConversation(npc)});
  choices.push({label:'Despedir-se',action:()=>this.story.dialogue.close(false)});this.living.say(id,[{speaker:npc.name.toUpperCase(),text:npc.lines[0],provenance:'school-fiction'}],{instant:true,choices});this.story.dialogue.advance();
 }
 dispose(){this.casualToken=-1;for(const s of [this.story,this.adventure,this.expansion,this.script,this.living])s.journey=null;}
}
