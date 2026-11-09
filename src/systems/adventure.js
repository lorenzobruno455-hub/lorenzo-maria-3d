import * as THREE from 'three';
import {QuestDirector,freshAdventure} from './quest-director.js';
import {ADVENTURES} from '../data/adventures.js';
import {CutsceneManager} from './cutscene-manager.js';
import {EnvironmentActions} from './environment-actions.js';
import {questEvent,unlockMemory} from './quests.js';
import {eventAction} from './events.js';
import {befriend} from './social.js';
const $=id=>document.getElementById(id),fiction=(speaker,text)=>({speaker,text,provenance:'school-fiction'});
const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
const button=(label,fn)=>{const b=node('button',label);b.onclick=fn;return b;};
export class Adventure {
 constructor({scene,world,living,story,player,character,camera,light,dialogue,audio,effects,getProgress,save,notify,startGame,onLock}){
  Object.assign(this,{scene,world,living,story,player,character,camera,dialogue,audio,getProgress,save,notify,startGame,onLock});this.owned=[];this.elapsed=0;
  this.actions=new EnvironmentActions({scene,player,character,audio});
  this.director=new QuestDirector({getState:()=>getProgress().adventure,save:s=>{getProgress().adventure=s;save();},onReward:r=>this.reward(r),onChange:()=>{this.autoKey='';}});
  this.cutscenes=new CutsceneManager({camera,actors:{lorenzo:character,...Object.fromEntries(living.actors.map(a=>[a.definition.id,a.character]))},light,dialogue,effects,reducedMotion:()=>matchMedia('(prefers-reduced-motion:reduce)').matches,onLock:value=>{onLock(value);$('cinematic').hidden=!value;if(value){story.close();this.updateSceneCaption();}},onFinish:({id,reason})=>{this.autoKey=reason==='error'?`${this.current?.id}:${this.current?.node}`:'';if(['complete','skipped'].includes(reason))this.director.emit('scene',id);else if(reason==='error')notify('Cena interrompida com segurança. Use Retomar aventura para tentar novamente.');save();},onError:()=>notify('Cena interrompida; os controles foram restaurados.')});
  $('scene-skip').onclick=()=>this.cutscenes.skip();$('scene-pause').onclick=()=>{if(this.cutscenes.paused)this.cutscenes.resume();else this.cutscenes.pause();$('scene-pause').textContent=this.cutscenes.paused?'Retomar cena':'Pausar cena';};
  $('adventure-open').onclick=()=>this.show();this.key=e=>{if(e.code==='Space'&&!e.repeat&&this.activityId==='music-rhythm'&&this.story.open&&this.story.page==='adventure-activity'){e.preventDefault();this.hit();}if(this.cutscenes.active&&e.code==='Escape'){e.preventDefault();this.cutscenes.skip();}};document.addEventListener('keydown',this.key);
  living.adventure=this;story.adventure=this;this.makeProps();this.reconcile();
 }
 reset(){this.cutscenes.skip();this.actions.clear();this.director.state=freshAdventure();this.getProgress().adventure=this.director.snapshot();this.autoKey='';this.activityId=null;this.save();}
 get busy(){return this.cutscenes.active||!!this.actions.active;}
 get current(){return this.director.current();}
 actor(id){return this.living.actors.find(a=>a.definition.id===id);}
 makeProps(){
  const teacher=this.world.placed.find(p=>p.name==='desk'&&p.position.x===-25&&p.position.z===-15);
  if(teacher){
   const canvas=document.createElement('canvas');canvas.width=256;canvas.height=192;const ctx=canvas.getContext('2d');
   ctx.fillStyle='#fff5dc';ctx.fillRect(0,0,256,192);ctx.fillStyle='#90d3eb';ctx.fillRect(12,12,232,140);ctx.fillStyle='#138a91';ctx.fillRect(32,60,190,86);ctx.fillStyle='#ffd43b';
   for(let x=48;x<210;x+=40)ctx.fillRect(x,77,22,32);
   ctx.fillStyle='#141824';ctx.font='bold 15px sans-serif';ctx.fillText('AURORA · CENOGRAFIA',20,177);
   this.photoMap=new THREE.CanvasTexture(canvas);this.photoMap.colorSpace=THREE.SRGBColorSpace;
   this.photoMaterial=new THREE.MeshToonMaterial({map:this.photoMap,gradientMap:this.world.resources.toonRamp()});
   const photo=new THREE.Mesh(this.world.resources.geometry('box'),this.photoMaterial);photo.scale.set(.48,.06,.38);photo.position.set(-25.65,this.world.library.tableSurface(teacher).height+.03,-15.15);photo.receiveShadow=true;photo.visible=false;photo.userData.inkDynamic=true;
   this.scene.add(photo);this.photo={id:'classroom-photo',name:'Fotografia da sala · ambientação fictícia',x:-25.65,z:-15.15,mesh:photo};this.owned.push(photo);
  }
  this.notebook=()=>this.story.world.objects.find(o=>o.id==='study-notebook');
 }
 start(id){
  if(id==='first-encounter'&&this.getProgress().stage<2){this.notify('Conclua o prólogo das três lembranças com Maria. A aventura acontece depois dele.');this.story.close();this.startGame();return false;}
  const c=this.current;if(c){if(c.id!==id){this.notify('Conclua a aventura em andamento antes de começar outra.');return false;}this.story.close();this.startGame();this.autoKey='';return true;}
  if(!this.director.start(id)){this.notify('Conclua Primeiro Encontro para liberar esta aventura.');return false;}
  if(id!=='first-encounter')eventAction(this.getProgress().living,id,'start');
  this.story.close();this.startGame();this.save();return true;
 }
 show(){this.story.show('adventures');$('story-title').textContent='Aventuras do Aurora · 0.7B';const content=this.story.content;
  content.append(node('p','Encenações fictícias e atividades da escola. As memórias originais continuam identificadas e preservadas.'));
  for(const d of ADVENTURES){const c=this.director.current(d.id),card=node('article');card.className='story-card';card.append(node('h3',d.title),node('p',c.status==='completed'?'✓ Aventura concluída':c.status==='active'?c.step.title:'Uma aventura de exploração, escolhas e descobertas.'),button(c.status==='completed'?'Rever conclusão':c.status==='active'?`Retomar: ${d.title}`:`Iniciar: ${d.title}`,()=>c.status==='completed'?this.replay(d.id):this.start(d.id)));content.append(card);}
 }
 replay(id){this.story.close();this.startGame();const sceneId={'first-encounter':'first-finale','lost-book':'book-finale','familiar-music':'music-finale'}[id],point=this.location?.scenePoint(sceneId);if(point&&point.floor!==this.location.floor){this.story.tracked={...point,name:'Rever conclusão · volte ao ambiente da cena'};this.notify(`Vá ao ${point.floor+1}º andar e selecione Rever conclusão novamente.`);return;}this.replaying=true;this.playScene(sceneId);}
 reward({questId,reward}){
  const p=this.getProgress();
  if(reward.memoryId&&!p.campaign.memories.includes(reward.memoryId)){questEvent(p.campaign,'visit');questEvent(p.campaign,'talk');unlockMemory(p.campaign,reward.memoryId);}
  if(reward.eventId){const s=p.living;eventAction(s,reward.eventId,'start');eventAction(s,reward.eventId,'find');eventAction(s,reward.eventId,'complete');befriend(s,reward.friendId,`adventure:${questId}`,1);}
  this.audio.setMood('completion');this.notify(`★ ${ADVENTURES.find(d=>d.id===questId).title} · aventura concluída`);this.save();
 }
 reconcile(){for(const d of ADVENTURES)if(this.director.current(d.id)?.status==='completed')this.reward({questId:d.id,reward:d.reward});}
 goal(){const c=this.current;if(!c?.step)return null;const s=c.step,target=this.target(s);return {...(target||this.location?.scenePoint(s.target)||s.position),name:`${c.title} · ${s.title}`};}
 target(step=this.current?.step){if(this.location)return this.location.adventureTarget(step);if(!step)return null;const id=step.target;
  if(['maria','bia','davi'].includes(id)){const a=this.actor(id);return {id,x:a.agent.position.x,z:a.agent.position.z,name:a.definition.name,kind:'adventure',height:1.5};}
  if(id==='classroom')return {id,x:-17,z:-7,name:'Sala de história'};
  if(id==='study-notebook')return {...this.notebook(),id,kind:'adventure',name:'Caderno de estudos · aventura'};
  if(id==='classroom-photo')return {...this.photo,kind:'adventure'};
  if(id==='shelf-clue'||id==='shelf-puzzle')return {id,x:23.5,z:-11.4,name:id==='shelf-clue'?'Pista entre as estantes':'Organizar as três lombadas',kind:'adventure',height:1.65};
  if(id==='lost-book'||id==='score'){const o=this.living.campus.objects.find(o=>o.id===(id==='score'?'familiar-music':id));return {...o,id,kind:'adventure',name:id==='score'?'Recolher partitura':'Recuperar o livro'};}
  if(id==='instrument'||id==='music-rhythm')return {id,x:31,z:-12.7,name:id==='instrument'?'Examinar o teclado':'Ensaio com Davi',kind:'adventure',height:1.3};
  if(id==='school-exercise')return {id,x:-20,z:-10,name:'Atividade de história · aventura',kind:'adventure',height:1.2};
  return null;
 }
 targets(){const s=this.current?.step;if(!s||!['examine','pickup','activity','talk','deliver','choice'].includes(s.type))return [];const t=this.target(s);return t?[t]:[];}
 handle(target){const c=this.current;if(!c?.step)return false;const s=c.step,id=target.id==='familiar-music'?'score':target.id;
  if(id!==s.target)return false;
  if(s.type==='choice'){this.autoKey='';return true;}
  if(s.type==='talk'||s.type==='deliver'){
   this.living.speakingId=id;
   const actor=this.actor(id);if(s.type==='deliver'){this.character.requestAction('pickup',{duration:.9});if(actor)actor.reaction=1.2;}actor?.character.requestAction(s.type==='deliver'?'react':'talk',{duration:1.2});
   const text=id==='maria'?'Neste encontro encenado, podemos escolher ouvir e participar da aula. O que você percebeu no caderno e na fotografia?':id==='bia'?(s.type==='deliver'?'A etiqueta confere: este é o livro! Obrigada por seguir as pistas e devolvê-lo.':'O marcador tem uma estrela e três palavras: Aurora, Jardim, Memória. Talvez as lombadas indiquem a ordem.'):c.node>2?'As pausas também fazem parte da música. Vamos ouvir juntos o resultado do ensaio.':'Minha partitura ficou na sala de música. Procure-a, experimente o teclado e ensaie o compasso.';
   this.dialogue.start([fiction(id.toUpperCase(),text)],{done:()=>this.director.emit(s.type,id)});return true;
  }
  if(s.type==='activity'){this.activity(s.target);return true;}
  const object=target.mesh||this.target(s)?.mesh;
  const kind=s.type==='pickup'?'pickup':id==='classroom-photo'?'photo':id==='instrument'?'instrument':'book';
  this.actions.play(kind,object,()=>{
   if(s.type==='pickup'){eventAction(this.getProgress().living,c.id,'find');this.director.emit('pickup',id);this.save();return;}
   const text=id==='study-notebook'?'Um caderno cenográfico: alguém começou a anotar a aula e deixou espaço para perguntas. Uma etiqueta convida a observar a fotografia.':id==='shelf-clue'?'Três lombadas têm desenhos em sequência: sol nascente → árvore → coração. Os títulos correspondem a Aurora → Jardim → Memória.':id==='instrument'?'Lorenzo experimenta três notas no teclado. O ensaio usa uma melodia original do jogo; o alvo visual permite jogar sem áudio.':'A fotografia de ambientação mostra uma escola fictícia. Ela não documenta o encontro real; o registro original será mostrado ao final.';
   if(id==='instrument'){this.audio.setMood('minigame');for(const a of this.living.actors.filter(a=>a.definition.id==='davi')){a.reaction=1.4;a.character.requestAction('react',{duration:1.4});}}
   this.dialogue.start([fiction('OBSERVAÇÃO',text)],{done:()=>this.director.emit('examine',id)});
  });return true;
 }
 activity(id){
  this.story.show('adventure-activity');$('story-title').textContent=id==='shelf-puzzle'?'As lombadas e o marcador':id==='school-exercise'?'Uma pergunta antes do sinal':'O ensaio da partitura';
  this.activityId=id;this.activityState={sequence:[],hits:0,attempts:0,phase:0,time:0,round:-1,pressed:false};this.drawActivity();
 }
 drawActivity(message=''){
  const id=this.activityId,s=this.activityState;if(!id||this.story.page!=='adventure-activity')return;const content=this.story.content;content.replaceChildren();if(message)content.append(node('p',message));
  if(id==='school-exercise'){
   content.append(node('p','Duas fontes contam sobre o mesmo dia: um relato pessoal e uma fotografia feita para o jogo. Qual preserva o acontecimento documentado?'));
   for(const [label,correct]of [['O relato original, mantendo a data e identificando a encenação como ficção',true],['A fotografia fictícia comprova todos os detalhes do encontro',false]])content.append(button(label,()=>correct?this.completeActivity(id):this.drawActivity('A foto é ambientação. Tente novamente: a fonte original deve ser preservada.')));
  }else if(id==='shelf-puzzle'){
   content.append(node('p','Organize: sol nascente → árvore → coração. Toque nas lombadas na ordem do marcador.'),node('p',s.sequence.join(' → ')||'Escolha a primeira lombada.'));
   for(const title of ['Memória','Aurora','Jardim']){const b=button(title,()=>{s.sequence.push(title);this.character.requestAction('point',{duration:.5});if(s.sequence.length===3){if(s.sequence.join(',')==='Aurora,Jardim,Memória')return this.completeActivity(id);s.sequence=[];return this.drawActivity('As lombadas não combinaram. A pista continua disponível; tente outra vez.');}this.drawActivity();});b.dataset.spine=title;content.append(b);}
  }else{
   content.append(node('p','Toque quatro vezes no centro dourado. São oito compassos por tentativa; nenhum áudio é obrigatório. Espaço também funciona.'));
   const lane=node('div');lane.className='rhythm-lane';const mark=node('span','♪');mark.id='adventure-note';lane.append(mark);const status=node('p');status.id='adventure-rhythm-status';content.append(lane,status,button('Tocar nota',()=>this.hit()));
  }
 }
 hit(){const s=this.activityState;if(this.activityId!=='music-rhythm'||!this.story.open||this.story.page!=='adventure-activity'||s.pressed)return;s.pressed=true;s.attempts++;if(Math.abs(s.phase-.5)<.22){s.hits++;this.audio.play('collect');this.character.requestAction('interact',{duration:.35});}if(s.hits>=4)this.completeActivity('music-rhythm');}
 completeActivity(id){this.activityId=null;this.story.close();this.director.emit('activity',id,{completed:true});this.audio.play('confirm');this.notify('Atividade concluída · a descoberta ganhou um novo sentido.');}
 updateSceneCaption(){const c=this.current;$('scene-title').textContent=c?.title||'Revisitar conclusão';$('scene-subtitle').textContent='Encenação fictícia · você pode pausar ou pular a cena';$('scene-pause').textContent='Pausar cena';}
 playScene(id){
  if(this.location){const scene=this.location.scene(id);if(!scene){this.autoKey='';return false;}this.cutscenes.play(scene);this.updateSceneCaption();return true;}
  const c=this.current,first=id.startsWith('first'),t=first?{x:-20,z:-11}:id==='book-finale'?this.actor('bia').agent.position:this.actor('davi').agent.position;
  const actor=first?'maria':id==='book-finale'?'bia':'davi';
  const staged=first?[{id:'lorenzo',state:'observe',position:[t.x,this.world.groundHeight(t.x,t.z),t.z],lookAt:[t.x-1.2,this.world.groundHeight(t.x,t.z),t.z]},{id:'maria',state:'talk',position:[t.x-1.2,this.world.groundHeight(t.x-1.2,t.z),t.z],lookAt:[t.x,this.world.groundHeight(t.x-1.2,t.z),t.z]}]:[{id:'lorenzo',state:'react'}];
  const shots=[{duration:1.3,camera:{from:[t.x+4,2.7,t.z+2],to:[t.x+3,2.8,t.z+2],lookAt:[t.x-.5,1.3,t.z]},actors:staged,light:{intensity:1.8}},{duration:1.4,camera:{to:[t.x+1.9,1.9,t.z+2],lookAt:[t.x,1.35,t.z]},actors:[{id:actor,state:'wave'},{id:'lorenzo',state:id==='first-intro'?'point':'react'}],effect:'AURORA'}];
  if(id==='first-finale')shots.push({duration:.5,dialogue:{speaker:'MEMÓRIA ORIGINAL',text:'19/08/2024 · Aula de história. Eu estava extremamente envergonhado, mas pedi para ficar com você.',provenance:'author-reported-memory'}});
  this.cutscenes.play({id,shots});this.updateSceneCaption();
 }
 update(dt,{active,paused}){
  if(this.photo&&!this.location)this.photo.mesh.visible=Math.hypot(this.player.position.x-this.photo.x,this.player.position.z-this.photo.z)<(this.living.settings.quality==='low'?20:55);
  if(paused)return;this.elapsed+=dt;this.actions.update(dt);this.cutscenes.update(dt);
  const c=this.current;
  if(!this.location&&c?.id==='lost-book'&&c.node<5&&!this.actions.active){const o=this.living.campus.objects.find(o=>o.id==='lost-book');if(o)o.mesh.visible=true;}
  if(!this.location&&c?.id==='familiar-music'&&c.node<3&&!this.actions.active){const o=this.living.campus.objects.find(o=>o.id==='familiar-music');if(o)o.mesh.visible=true;}
  if(!c||this.busy||this.dialogue.open||this.story.open)return;
  const s=c.step,key=`${c.id}:${c.node}`;
  if(s.type==='scene'&&this.autoKey!==key){this.autoKey=key;this.playScene(s.target);return;}
  if(s.type==='choice'&&this.autoKey!==key&&(!this.location||this.target(s)?.floor===this.location.floor)){this.autoKey=key;this.dialogue.start([fiction('ESCOLHA DA AVENTURA',s.title)],{instant:true,choices:s.choices.map(option=>({label:option.label,action:()=>this.director.choose(option.id)}))});this.dialogue.advance();return;}
  if(s.type==='visit'&&active){const t=this.target(s);if((!this.location||t.floor===this.location.floor)&&Math.hypot(this.player.position.x-t.x,this.player.position.z-t.z)<2.5)this.director.emit('visit',s.target);}
 }
 updateActivity(dt){if(this.activityId!=='music-rhythm'||!this.story.open||this.story.page!=='adventure-activity')return;const s=this.activityState;s.time+=dt;s.phase=(s.time%1.6)/1.6;const round=Math.floor(s.time/1.6);if(round!==s.round){s.round=round;s.pressed=false;}const mark=$('adventure-note');if(mark)mark.style.left=`${s.phase*94}%`;const status=$('adventure-rhythm-status');if(status)status.textContent=`${s.hits}/4 notas · compasso ${round%8+1}/8`;if(round>=8){s.time=0;s.round=-1;s.hits=0;s.attempts=0;this.drawActivity('Vamos ensaiar novamente. A partitura continua com você.');}}
 dispose(){this.cutscenes.dispose();this.actions.dispose();document.removeEventListener('keydown',this.key);this.owned.forEach(o=>o.removeFromParent());this.photoMaterial?.dispose();this.photoMap?.dispose();}
}
