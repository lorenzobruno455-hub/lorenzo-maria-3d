import {memories} from '../systems/quests.js';
export const FICTION = 'Ficção narrativa inspirada no casal · não altera as memórias históricas.';
export const PLANS = [
 ['Preparação','Abrir o caderno'],['Preparação','Escolher uma caneta'],['Preparação','Escrever “oi”'],['Preparação','Ensaiar o “oi” em silêncio'],
 ['Logística','Desenhar uma rota até a carteira'],['Logística','Calcular a distância de três passos'],['Logística','Reservar um plano B para o cadarço'],['Logística','Consultar Bia sobre a rota'],
 ['Coragem','Respirar sem consultar o manual'],['Coragem','Guardar o mapa de três passos'],['Coragem','Levantar da cadeira'],
 ['Conversa','Caminhar até Maria'],['Conversa','Dizer “oi” de verdade'],['Conversa','Ouvir a resposta sem abrir a planilha'],
].map(([block,label],i)=>({id:`plan-${i+1}`,block,label}));
export const LETTER = [
 'Às vezes uma lembrança começa pequena.',
 'Quando prestamos atenção, ela ganha um lugar nas nossas palavras.',
 'Por isso guardo o que aprendemos ao ouvir um ao outro.',
 'Mesmo quando faltam palavras, podemos escolher cuidar do que ficou.',
 'E deixar espaço para as próximas lembranças, sem apressar a história.',
];
export const SYMBOLS = ['Caderno','Marcador','Luz','Coração','Flor','Arquivo'];
export const PUZZLES = {
 plan:{cards:PLANS,hint:'Preparação: caderno → caneta → escrever → ensaiar. Logística: rota → distância → plano B → Bia. Coragem: respirar → guardar → levantar. Conversa: caminhar → dizer oi → ouvir.'},
 letter:{cards:LETTER.map((label,i)=>({id:`letter-${i+1}`,label})),hint:'Começo pequeno → atenção → por isso → mesmo quando → próximas lembranças.'},
 visual:{cards:[{id:'sun',label:'☀ Sol nascente'},{id:'tree',label:'♣ Árvore'},{id:'heart',label:'♥ Coração'}],hint:'O marcador mostra o dia nascer, a árvore crescer e o carinho ficar: sol → árvore → coração.'},
 box:{cards:[{id:'seed',label:'Semente'},{id:'sprout',label:'Broto'},{id:'flower',label:'Flor'}],hint:'Uma planta começa como semente, vira broto e só depois dá flor.'},
 tuning:{kind:'sequence',cards:[{id:'lorenzo',label:'★ LorenzoFM · amarelo'},{id:'maria',label:'◆ MariaFM · rosa'},{id:'juntos',label:'♥ LorenzoeMariaFM · ciano'}],hint:'A bobina aponta a estrela; o cristal, o losango; a antena, o coração. Ordem: ★ → ◆ → ♥.'},
 timeline:{cards:memories.map(m=>({id:m.id,label:`${m.date} · ${m.title}`})),hint:'Compare dia/mês/ano, começando por 2024. Os títulos e as datas são os registros originais.'},
 association:{cards:memories.map((m,i)=>({id:m.id,label:`${SYMBOLS[i]} · ${m.environment}`})),hint:memories.map((m,i)=>`${i+1}: ${SYMBOLS[i]} → ${m.environment}`).join(' | ')},
};
const t=(id,type,target,title,text='',extra={})=>({id,type,target,title,text,...extra});
export const EXPANSION = [
 {id:'plan',title:'O Plano de 14 Etapas',achievement:'O Estrategista',item:'Caderno dos Planos',finale:'Maria sorri: “Você podia começar pelo oi.” Lorenzo fecha o caderno. Bia decide arquivar a planilha de três passos.',tasks:[
  t('find','examine','plan-notebook','Encontrar o caderno na sala de história','Um caderno cenográfico anuncia: “Plano de 14 etapas para dizer oi”. Faltam páginas. A primeira pede uma caneta antes de qualquer estratégia.'),
  t('bia','talk','bia','Conversar com Bia na biblioteca','Bia: “Dividi as páginas em três conjuntos: mesa da aula, leitura e corredor. A organização é séria; o plano, nem tanto.”',{choices:['Pedir uma pista sobre os blocos','Admitir que três passos bastavam']}),
  t('pages','collect',null,'Recolher três conjuntos de páginas','As páginas formam quatro blocos: Preparação, Logística, Coragem e Conversa.',{targets:['plan-pages-a','plan-pages-b','plan-pages-c']}),
  t('order','puzzle','plan-notebook','Organizar as 14 etapas no caderno','Toque em dois cartões para trocar suas posições.',{puzzle:'plan'}),
  t('maria','talk','maria','Conversar com Maria','Maria: “Se a conversa precisa de quatorze etapas, podemos pular o formulário e começar pelo oi?”',{choices:['Dizer oi e ouvir Maria','Mostrar a Bia o plano simplificado']}),
  t('scene','scene','plan-notebook','Concluir a encenação na sala de história'),
 ]},

 {id:'letter',title:'Uma Carta Nunca Entregue',achievement:'Palavras Guardadas',item:'Envelope Restaurado',finale:'Os cinco trechos voltam ao envelope cenográfico. A carta fala de atenção e cuidado; a carta final original permanece guardada no seu próprio lugar no álbum.',tasks:[
  t('envelope','examine','letter-envelope','Examinar o envelope na biblioteca','Este envelope fictício contém uma pista: um marcador mostra sol → árvore → coração. O primeiro trecho está num livro; Bia conhece o caminho do terceiro.'),
  t('fragment-1','collect',null,'Encontrar o fragmento no livro','Primeiro fragmento: '+LETTER[0],{targets:['letter-fragment-1']}),
  t('visual','puzzle','letter-mural','Decifrar o marcador no corredor','O desenho do marcador passa do amanhecer à árvore e termina num coração.',{puzzle:'visual'}),
  t('fragment-2','collect',null,'Recolher o trecho atrás do marcador','Segundo fragmento: '+LETTER[1],{targets:['letter-fragment-2']}),
  t('bia','talk','bia','Pedir a Bia a localização do terceiro trecho','Bia: “O terceiro ficou na mesa de história. O quarto está na caixa de leitura do jardim do campus. Saia pelos portões a pé: o jardim ainda é o mesmo.”',{choices:['Anotar a pista do jardim','Confirmar a mesa de história']}),
  t('fragment-3','collect',null,'Examinar a pasta na sala de história','Terceiro fragmento: '+LETTER[2],{targets:['letter-fragment-3']}),
  t('fragment-4','collect',null,'Examinar a caixa de leitura no jardim do campus','Quarto fragmento: '+LETTER[3]+' No fundo da caixa há desenhos de uma semente, um broto e uma flor.',{targets:['letter-fragment-4']}),
  t('box','puzzle','letter-box','Abrir o compartimento de papel no jardim','Organize o crescimento da planta para abrir a aba do envelope cenográfico.',{puzzle:'box'}),
  t('fragment-5','collect',null,'Recolher o último fragmento no jardim','Quinto fragmento: '+LETTER[4],{targets:['letter-fragment-5']}),
  t('restore','puzzle','letter-envelope','Montar a carta na biblioteca','As cinco frases formam uma carta fictícia. Organize a ligação entre elas.',{puzzle:'letter'}),
  t('scene','scene','letter-envelope','Guardar a carta restaurada na biblioteca'),
 ]},


 {id:'frequency',title:'A Frequência Perdida',achievement:'Na Mesma Frequência',item:'Rádio Restaurado',finale:'O rádio cenográfico encontra uma mensagem: “Escutar também é uma forma de guardar.” Davi registra a transmissão fictícia. LorenzoFM, MariaFM e LorenzoeMariaFM continuam disponíveis como sempre.',tasks:[
  t('radio','examine','radio-antique','Investigar o rádio antigo no salão','O rádio é um objeto cenográfico: nenhuma transmissão externa é captada. Três espaços coloridos aguardam símbolos. Davi reconhece o desenho.'),
  t('davi','talk','davi','Conversar com Davi no salão','Davi: “Procure a bobina de papel na ciência, o cristal cenográfico na biblioteca e a antena de cartão no salão. Cada etiqueta guarda um símbolo, na ordem em que listei.”',{choices:['Anotar a ordem dos componentes','Perguntar sobre as rádios']}),
  t('components','collect',null,'Encontrar e examinar os três componentes fictícios','As etiquetas são pistas: bobina = ★ amarelo, LorenzoFM; cristal = ◆ rosa, MariaFM; antena = ♥ ciano, LorenzoeMariaFM. São símbolos de um puzzle, sem equipamento real.',{targets:['radio-coil','radio-crystal','radio-antenna']}),
  t('tuning','puzzle','radio-antique','Retornar ao rádio e recuperar a sintonia','Coloque os três canais simbólicos na ordem das etiquetas citadas por Davi. Você pode jogar sem ouvir música.',{puzzle:'tuning'}),
  t('message','examine','radio-antique','Examinar a mensagem recuperada','Transmissão fictícia restaurada: “Escutar também é uma forma de guardar. Quando a conversa encontra espaço, cada voz deixa uma lembrança.” Nenhum fato histórico foi acrescentado.'),
  t('scene','scene','radio-antique','Celebrar a sintonia no salão'),
 ]},

];
export const missionById=id=>EXPANSION.find(m=>m.id===id);
