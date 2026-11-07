# Lorenzo & Maria 3D — 0.5

## Auditoria e correções

A [auditoria](AUDITORIA-05.md) identificou a causa comum das peças suspensas: altura fixa independente do modelo/superfície. `placeOn` usa Box3, origem real, rotação e escala; superfícies com malha podem usar raycasting. O diagnóstico verifica a diferença entre base e apoio. Objetos animados/suspensos são exceções explícitas, não correções arbitrárias.

- Carteiras reconstruídas com tampo fino, estrutura tubular e porta-livros; cadeiras com quatro pés e encosto proporcional.
- Livros apoiados em mesas e prateleiras; estantes com laterais, fundo e quatro níveis de volumes individuais.
- Biblioteca ganha mesas de leitura e luminárias; sala recebe livros, cadernos, mesa docente e relógio.
- Vãos de janela substituem placas sobre paredes opacas. Materiais procedurais têm variação menos contrastada.
- Bancos de reflexão e assentos sociais recebem pernas; flores recebem hastes ligadas ao canteiro.
- Objetos de missão passam a ter suportes e colisões reais. Dois itens do prólogo e duas posições técnicas de memória foram deslocados para liberar as entradas. Datas, títulos, descrições, requisitos e recompensas originais permanecem preservados.
- Altura do personagem acompanha os pisos locais e a base do modelo é normalizada. Caminhada procedural com avanço proporcional à distância permanece provisória.

## Sistemas

`prop-library.js` constrói 12 tipos reutilizáveis, catalogados em `data/props.json` nas dez categorias pedidas. Geometrias/materiais são compartilhados; malhas estáticas, inclusive dentro de grupos, são agrupadas por material.

`prop-placement.js`: dimensões medidas, apoio, superfície, escala, rotação e geração de colisão a partir da mesma geometria.

`environment-validator.js`: abra `/?debug` e pressione **F3** para ligar/desligar caixas dos objetos, colisões vermelhas, origens, pontos verdes de apoio, grades de superfícies e caixas dos personagens. Helpers são descartados ao desligar. Diagnóstico acessível via módulo somente de leitura, sem teleporte em produção.

`interaction-registry.js`: seleção/ativação comum aos objetos existentes, com identificadores estáveis, alcance, requisitos e teste de segmento contra obstáculos na altura efetiva. As ações delegam aos sistemas de missões/diálogos existentes. Portas permitem acesso ao próprio puxador, mas outras paredes continuam bloqueando. Contextos de conversa em caderno, livro de física, fones e carta reutilizam falas criativas originais, sem inventar acontecimentos reais. Interações examinadas persistem no salvamento. Banco de reflexão permite sentar e levantar ao mover.

## Biblioteca das Memórias

Estante expositora dentro da biblioteca, com seis livros físicos individuais. Capas trazem título, data e raridade originais; um fecho identifica os bloqueados. A proximidade destaca discretamente o livro e mostra a ação contextual.

Os livros desbloqueados abrem a capa com interpolação, aproximam a câmera e exibem a memória original; ao terminar/fechar, a capa e a câmera retornam. Releituras preservam recompensas. Livros bloqueados mostram o capítulo necessário, sem permitir atalhos. O álbum permanece disponível. Os seis locais da campanha também receberam objetos materiais diferentes, apoiados, em vez de caixas girando no ar. Luzes e bolinhas permanentes desses itens foram retiradas.

## Desempenho e salvamento

Mantidos Baixa/Média/Alta, sombras configuráveis e redução adaptativa. Props narrativos e placas distantes são ocultados na qualidade baixa. Capas locais têm 256×384 pixels; nenhuma dependência de CDN durante o jogo. Sem pós-processamento adicional. Recursos próprios e helpers são descartados. O adaptador GLB dos personagens permanece disponível.

A chave `lorenzo-maria-v04` e esquema 4 foram mantidos para compatibilidade; a versão do aplicativo é 0.5.0. Campos opcionais de interações são validados sem apagar campanha, rotinas, recompensas ou configurações.

## Testes

Resultados: **25 testes unitários aprovados**, **32 cenários de navegador aprovados ao combinar regressão e reexecuções corretivas**, e `npm run build` aprovado (52 módulos). A rodada completa executou 30 cenários: 26 passaram e quatro falharam. Após corrigir seleção por altura, aproximações às novas colisões e sentido da capa, a rodada direcionada de oito passou integralmente, incluindo os quatro casos e dois novos cenários de banco/caderno. Não se apresenta isso como uma única rodada de 32 sem falhas. Incluem regressão do prólogo, seis capítulos, diálogos, atividades, persistência e Android emulado; novos testes de apoio por Box3/raycast, obstáculos/requisitos do registro, seis livros, bloqueio e F3.

As fixtures que antes iniciavam dentro de um objeto agora começam em posição de aproximação válida. Isso valida interações e preservação; não substitui percorrer cada trajeto manualmente.

## Capturas e revisão visual

[Capturas](captures/v05) de sala, biblioteca, jardim/pátio, caminhada, livros e interação narrativa. As imagens de ambiente ocultam a interface após pausar para permitir inspeção; usam qualidade baixa em Chromium/SwiftShader. Comparativos anteriores estão disponíveis para três vistas, com posições de câmera diferentes; não são medições pixel a pixel.

A inspeção detectou mobiliário obstruindo as entradas e uma capa abrindo para baixo. A capa agora abre para cima e a câmera usa enquadramento de leitura sem o protagonista tapar o livro. A interface desloca-se para a lateral nessa leitura. As peças foram reposicionadas e a simulação das seis rotinas com colisões reais foi repetida. A biblioteca recebeu área de memórias própria após a primeira revisão de composição.

## Recursos externos e limitações

- **fal:** modelo Tripo H3.1 recomendado para uma cadeira de 3.000 faces. O envio foi recusado pelo journal do serviço (403), sem job criado; recuperação retornou `not_found` e não autorizou reenvio automático. Nenhum recurso gerado, de licença desconhecida ou não inspecionado foi integrado.
- **Superpowers:** instalado segundo o catálogo, mas sem skill/ferramentas expostas nos catálogos cloud e executor desta sessão. Não foi possível executar esse plugin; auditoria, testes e revisão foram realizados com as ferramentas disponíveis.
- Modelos continuam procedurais, com acabamento estilizado. Ainda não equivalem a personagens/ambientes semirrealistas finais; não há novas aparências pessoais inventadas.
- Sem IK de pés ou expressões faciais; sentar e caminhar ainda têm limitações de articulação. Personagens GLB definitivos dependem de referências e recursos validados.
- Colisões são AABBs e o movimento é planar; não há escadas nem segundo andar. Props pequenos apoiados não bloqueiam o corpo; seus móveis de sustentação bloqueiam.
- Texturas são locais procedurais, sem pacote fotográfico PBR ou texturas comprimidas KTX2. Bundle principal 693 kB (193 kB gzip); Vite mantém aviso de chunk acima de 500 kB. Sem benchmark em Samsung físico; não há promessa de FPS de hardware real.
- O indicador HUD de missão continua por acessibilidade e compatibilidade. Não foram adicionados marcadores luminosos permanentes de narrativa.

## Próximas prioridades

Validar GLBs licenciados e otimizados; referências autorizadas dos protagonistas; IK e poses de assento; medição em A35/S24 Ultra; atlas de materiais e revisão artística com sombras nas três qualidades. Não ampliar o mapa antes desse acabamento.

## Arquivos alterados

- `.gitignore`
- `README.md`
- `docs/AUDITORIA-05.md`
- `docs/ENTREGA-05.md`
- `docs/captures/v05/after-classroom.png`
- `docs/captures/v05/after-courtyard.png`
- `docs/captures/v05/after-garden.png`
- `docs/captures/v05/after-library.png`
- `docs/captures/v05/after-memory-books.png`
- `docs/captures/v05/after-walking.png`
- `docs/captures/v05/before-classroom.png`
- `docs/captures/v05/before-garden.png`
- `docs/captures/v05/before-library.png`
- `docs/captures/v05/narrative-book.png`
- `index.html`
- `package-lock.json`
- `package.json`
- `scripts/capture-visuals.mjs`
- `src/data/interactions.json`
- `src/data/memories.json`
- `src/data/props.json`
- `src/main.js`
- `src/style.css`
- `src/systems/batching.js`
- `src/systems/camera.js`
- `src/systems/campus-world.js`
- `src/systems/character.js`
- `src/systems/environment-validator.js`
- `src/systems/interaction-registry.js`
- `src/systems/living.js`
- `src/systems/progress.js`
- `src/systems/prop-library.js`
- `src/systems/prop-placement.js`
- `src/systems/resources.js`
- `src/systems/story-world.js`
- `src/systems/story.js`
- `src/systems/world.js`
- `tests/game.spec.js`
- `tests/living.spec.js`
- `tests/story.spec.js`
- `tests/unit/spatial.test.js`
- `tests/visual.spec.js`
