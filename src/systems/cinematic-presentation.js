import {memories} from './quests.js';
/** One lightweight DOM overlay; updated only at narrative beats, never per frame. */
export class CinematicPresentation {
 constructor(){
  this.root=document.createElement('aside');this.root.id='cinematic-beat';this.root.hidden=true;
  this.caption=document.createElement('strong');this.root.append(this.caption);
  this.memories=document.createElement('div');this.memories.className='cinematic-memories';
  for(const memory of memories){const chip=document.createElement('span');chip.textContent=`${memory.title} · ${memory.date}`;this.memories.append(chip);}
  this.root.append(this.memories);document.getElementById('cinematic').append(this.root);
 }
 show(direction){this.root.hidden=false;this.root.dataset.mode=direction.mode;this.caption.textContent=direction.object||'Sexta aula · 19/08/2024';document.getElementById('dialog').dataset.cinematicMode=direction.mode;this.memories.hidden=direction.mode!=='diary';}
 beat({direction,index,line}){
  this.show(direction);
  if(direction.mode==='classes')this.caption.textContent=index>=16?'Quinta aula':index>=11?'Recreio':'As aulas passam · hesitação';
  if(direction.mode==='messages')this.caption.textContent='06/07/2024 · representação do roteiro, não transcrição';
  if(direction.mode==='document')this.caption.textContent='Marco registrado · detalhes não confirmados preservados como lacunas';
  if(direction.mode==='diary'){const selected=Math.min(5,Math.floor(index*6/14));[...this.memories.children].forEach((chip,i)=>chip.classList.toggle('current',i===selected));}
 }
 hide(){this.root.hidden=true;delete document.getElementById('dialog').dataset.cinematicMode;}
 dispose(){this.hide();this.root.remove();}
}
