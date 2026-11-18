// Existing gameplay coordinates, not measurements of the real school.
import {NARRATIVE_POINTS as P} from '../systems/school-narrative-map.js';
export const SCRIPT_CHOICES={
 'PRO-CENA01':[['open','Abrir agora'],['look','Olhar a sala primeiro']],
 'CAP01-CENA01':[['ask','Perguntar quem é','caio','Maria, eu acho.'],['change','Mudar de assunto','caio','Tá, eu não vi nada.']],
 'CAP01-CENA02':[['joke','Continuar a brincadeira','maria','Você não existe.'],['help','Perguntar se precisam de ajuda','maria','Acho que já estão vendo isso.']],
 'CAP01-CENA03':[['help','Ajudar na atividade'],['honest','Admitir que não sabe']],
 'CAP01-CENA04':[['joke','Mandar piada'],['thanks','Agradecer','maria','De nadaaa.']],
 'CAP01-CENA05':[['keep','Guardar conversa'],['close','Fechar celular']],
 'CAP01-CENA07':[['reply','Responder normalmente'],['close','Encerrar por hoje']],
 'CAP01-CENA08':[['talk','Puxar assunto'],['wait','Esperar']],
 'CAP01-CENA10':[['joke','Provocar de novo','maria','Eu vou ignorar você.'],['help','Ajudar na tarefa','maria','Tá, isso foi útil.']],
 'CAP01-CENA11':[['keep','Guardar lembrança'],['explore','Continuar explorando']],
 'CAP02-CENA02':[['calendar','Ler calendário'],['photo','Inspecionar fotografia']],
 'CAP03-CENA03':[['trust','Confiar'],['change','Mudar'],['forgive','Perdoar']],
 'EP-CENA01':[['Amanhã','Amanhã'],['Próxima página','Próxima página'],['Nossa história continua','Nossa história continua']],
};
const named=(key,name,extra={})=>({...P[key],name,...extra});
const garden=(name,x=12,z=23)=>({outside:true,x,z,name,top:.03});
const book=()=>named('album','Álbum · biblioteca');
export function sceneStops(id){
 const m={
 'PRO-CENA01':[book()],
 'CAP01-CENA01':[named('classroom-photo','Fotografia de 2023 · conversa recriada')],
 'CAP01-CENA02':[named('study-notebook','Chromebook · primeiro sorriso',{model:'computer'})],
 'CAP01-CENA03':[named('school-exercise','Atividade escolar')],
 'CAP01-CENA04':[named('study-notebook','Celular · conversa recriada')],
 'CAP01-CENA05':[named('study-notebook','Celular · 06/07/2024')],
 'CAP01-CENA06':[{floor:0,x:0,z:8,name:'Corredor · algumas semanas depois',top:.03}],
 'CAP01-CENA07':[named('study-notebook','Celular · retomada de contato')],
 'CAP01-CENA08':[named('school-exercise','Primeira aula · observar a atividade'),{floor:0,x:0,z:8,name:'Recreio · atravessar o corredor',top:.03},named('classroom-photo','Quinta aula · observar o relógio')],
 'CAP01-CENA09':[named('classroom','Sexta aula · aproximar-se de Maria')],
 'CAP01-CENA10':[named('reflection-seat','20/08/2024 · tomar assento')],
 'CAP01-CENA11':[named('study-notebook','Caderno · pequenas coisas')],
 'CAP02-CENA02':[{floor:0,x:0,z:-4,name:'Marcador · tempo',top:.03},garden('Marcador · distância',12,22),named('album','Marcador · carta')],
 'CAP02-CENA04':[{floor:0,x:0,z:-12,name:'Janela do corredor · álbum',top:.03}],
 'CAP03-CENA01':[named('shelf-clue','Livro de perguntas')],
 'CAP03-CENA02':[named('science-book','Sala de estudos · reflexão')],
 'CAP03-CENA03':[garden('Jardim · uma conversa sobre fé')],
 'CAP04-CENA02':[named('instrument','Salão · intervalo musical')],
 'CAP05-CENA01':[garden('Flores no arquivo',12,22)],
 'CAP05-CENA02':[garden('Fita vermelha',12,23),garden('Fita azul',15,22),garden('Fita dourada',12,22)],
 'CAP06-CENA02':Array.from({length:5},(_,i)=>named(`memory-${i+1}`,`Revisão · lembrança ${i+1}`)),
 'EP-CENA02':[garden('Depois dos créditos · encontro da turma',12,22)],
 };
 return (m[id]||[book()]).map((p,i)=>({...p,stopId:`${id}:${i}`}));
}
export const SCENE_PUZZLES={
 'CAP03-CENA01':{cards:['Observar','Perguntar','Escutar','Refletir'],hint:'Observe primeiro. Depois pergunte, escute e reflita. Não há pontuação religiosa.'},
};
export const MISSION_SCENES={
 'first-encounter:maria':['AV01-CENA01'],
 'lost-book:bia':['AV02-CENA01'],'lost-book:delivery':['AV02-CENA02'],
 'familiar-music:davi':['AV03-CENA01'],'familiar-music:return':['AV03-CENA02'],
 'plan:find':['AV04-CENA01'],'plan:maria':['AV04-CENA02'],
 'letter:envelope':['AV05-CENA01'],'letter:fragment-5':['AV05-CENA02'],'letter:scene':['AV05-CENA03'],
 'frequency:davi':['AV06-CENA01'],'frequency:message':['AV06-CENA02'],
 'archive:find':['AV07-CENA01'],'archive:diary':['AV07-CENA02'],'archive:scene':['AV07-CENA03'],
};
