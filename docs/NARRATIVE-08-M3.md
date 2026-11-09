# São Jorge 0.8 M3 — localização narrativa

O adaptador `SchoolNarrative` empresta os mesmos personagens, objetos, livros, `Story`, `LivingSchool`, `Adventure`, `QuestDirector` e `CutsceneManager`. Não existe segunda campanha. Coordenadas ficcionais são definidas em `school-narrative-map.js`, fora dos registros originais de memórias e capítulos.

| Conteúdo | Localização de jogo |
| --- | --- |
| Maria / Primeiro Encontro | Sala de aula A, primeiro pavimento |
| Bia / O Livro Perdido | Biblioteca, primeiro pavimento |
| Seis livros titulados e datados | Mesa de leitura da biblioteca; mesmos IDs e bloqueios |
| Helena / física / quiz | Sala de ciências, segundo pavimento |
| Davi / partitura / instrumento / ritmo | Salão multiuso, terceiro pavimento |
| Caio / bola | Salão, terceiro pavimento |
| Lia / lanches virtuais | Encontro na secretaria, primeiro pavimento; não afirma existência de cantina nesse setor real |
| Memórias de jardim, pátio e reflexão | Pontos de leitura adaptados em salas/salão; descrições históricas e datas originais permanecem intactas |

## Objetivos e persistência

Cada ponto possui piso, coordenadas e aproximação acessível. Interações são filtradas por piso antes do teste de proximidade e oclusão. Objetivos em outro pavimento apontam ao patamar seguinte; visitas de capítulo verificam também o piso. Os NPCs executam rotinas locais, limitadas ao pavimento, e mantêm-se disponíveis quando uma missão ou conversa precisa deles.

O progresso de missões, escolhas, cartas, inventário, relações e minijogos usa os campos existentes. `schoolVisit.actors` guarda somente posições, piso, direção e índice de rotina dos seis atores; o carregamento valida IDs e coordenadas. Saves M1/M2 recebem esse campo vazio. O backup pré-0.8 permanece inalterado.

Ao sair de São Jorge, são restaurados os pais, transformações, visibilidade e rotinas do campus anterior. Coordenadas escolares não substituem `progress.position`, nem a posição do outro campus é gravada como visita escolar. As conquistas obtidas continuam compartilhadas. Inspeção oculta os elementos narrativos; não executa missões nem rotinas. Menus da campanha ficam disponíveis durante exploração e o toolbar fica inerte durante diálogos, atividades e cenas.

## Cenas e leitura

As cenas usam pontos de encenação do ambiente atual e altura do respectivo piso, restaurando controles e transformações ao pular/concluir. Os livros reutilizam as capas e a abertura articulada existentes. O registro original é apresentado sem alterar datas, acontecimentos ou texto. A encenação de Primeiro Encontro continua explicitamente fictícia.

Nenhuma medida ou nova instalação real do Colégio São Jorge é confirmada por esses pontos. O salão não ganhou palco ou infraestrutura presumida. Não há serviços pagos nem novos downloads externos.
