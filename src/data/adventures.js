// All staging and choices below are school fiction. Only memory-1's source text is historical.
const locations = {
 classroom: { x: -14, z: -7.5 }, 'study-notebook': { x: -14, z: -10.5 },
 'classroom-photo': { x: -11, z: -10 }, maria: { x: 0, z: 13 }, bia: { x: 12, z: -6 },
 'shelf-clue': { x: 17, z: -11 }, 'shelf-puzzle': { x: 17, z: -11 }, 'lost-book': { x: 17, z: -11 },
 davi: { x: 8, z: 12 }, score: { x: 11, z: 10 }, instrument: { x: 12, z: 12 },
};
const step=(id,type,target,title,place=target,extra={})=>({id,type,target,title,targetLabel:title,position:{...(locations[place]||locations.classroom)},...extra});
const choice=(id,target,title,options,place=target)=>step(id,'choice',target,title,place,{choices:options.map(([id,label])=>({id,label}))});
export const ADVENTURES = [
 { id:'first-encounter',title:'Primeiro Encontro',provenance:'fictional-school-staging',prerequisites:[],reward:{memoryId:'memory-1'},memory:{id:'memory-1',date:'19/08/2024',description:'Aula de história. Eu estava extremamente envergonhado, mas pedi para ficar com você.'},steps:[
  step('intro','scene','first-intro','Assista à chegada na escola'),
  step('classroom','visit','classroom','Entre na sala de história'),
  step('notebook','examine','study-notebook','Examine o caderno de estudos'),
  step('photo','examine','classroom-photo','Observe a fotografia da sala'),
  step('maria','talk','maria','Converse com Maria'),
  choice('approach','maria','Como participar da conversa?', [['listen','Ouvir com atenção'],['ask','Perguntar sobre a aula']]),
  step('exercise','activity','school-exercise','Conclua o exercício da sala','classroom'),
  step('finale','scene','first-finale','Conclua a cena da primeira lembrança','classroom'),
 ]},
 {id:'lost-book',title:'O Livro Perdido',provenance:'fictional-school-staging',prerequisites:['first-encounter'],reward:{friendId:'bia',eventId:'lost-book'},steps:[
  step('bia','talk','bia','Converse com Bia'),
  choice('help','bia','Como procurar o livro?', [['clues','Seguir as pistas'],['shelves','Conferir as estantes']]),
  step('clue','examine','shelf-clue','Leia a pista na estante'),
  step('puzzle','activity','shelf-puzzle','Conclua o desafio da estante'),
  step('book','pickup','lost-book','Recolha o livro perdido'),
  step('delivery','deliver','bia','Entregue o livro a Bia'),
  step('finale','scene','book-finale','Conclua a devolução do livro','bia'),
 ]},
 {id:'familiar-music',title:'Uma Música Conhecida',provenance:'fictional-school-staging',prerequisites:['first-encounter'],reward:{friendId:'davi',eventId:'familiar-music'},steps:[
  step('davi','talk','davi','Converse com Davi'),
  choice('music','davi','Como começar o ensaio?', [['practice','Ensaiar com calma'],['rhythm','Prestar atenção ao ritmo']]),
  step('score','pickup','score','Recolha a partitura'),
  step('instrument','examine','instrument','Examine o instrumento'),
  step('rhythm','activity','music-rhythm','Conclua o exercício de ritmo','instrument'),
  step('return','talk','davi','Conte a Davi sobre o ensaio'),
  step('finale','scene','music-finale','Conclua a cena do ensaio','davi'),
 ]},
];
