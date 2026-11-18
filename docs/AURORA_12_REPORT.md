# Aurora 1.2 — candidata para avaliação

Branch: `feat/aurora-12-ultimate-colorbeat`.
Base real: `3907bc29abe3390486006ca89f73455b777d69e4`, versão 1.15, branch `feat/aurora-115-narrative-ux` / PR #26. Não foi usada a main como suposição de versão atual.

Código: `fd34d1c6034206e519d496138f051c958b2fea9f`. Ajustes das fixtures de QA: `7fb5c3d72fac70503bb99973ee37c5ac328c774a`.
Sem merge, deploy ou atualização do site.

## Resultado visual

- Bandas cel com antialiasing nas transições, preservando cores aprovadas e contornos existentes. Nenhum passe, luz ou textura adicional para esse ajuste.
- Contatos gráficos dos sete atores usando um único lote instanciado. Coordenadas mundiais corretas também quando Lorenzo pertence ao grupo rotacionado da escola. Alturas dos pisos e da quadra respeitadas; contatos planos ocultados nas escadas.
- Carteiras com capas variadas, pastas e borrachas em espaços livres. Geometrias e paleta compartilhadas; orçamento existente de até 22 lotes de mobiliário por pavimento preservado.
- Menu com cinco ações e faixas Colorbeat; Maria mantém exatamente três opções. Álbum com cartões de alto contraste, datas legíveis, duas colunas em paisagem e uma em telas estreitas.
- Preferências persistentes de movimento reduzido e efeitos de descoberta. A preferência de acessibilidade do sistema continua valendo. Reutilizados câmera, cutscenes, digitação, partículas e realces existentes.

Campus, fachada, quadra, recepção, dois corredores, duas salas, escadas, biblioteca, laboratório, sala dos professores, salão e jardim foram registrados. Ambientes já decorados foram preservados; não foram reconstruídos para produzir diferenças artificiais.

[Direção de arte e inventário por ambiente](AURORA_12_ART_DIRECTION.md) · [Comparador visual interativo](captures/aurora12/comparar.html).

## Evidências visuais

18 pares reais antes/depois: 15 vistas do mundo e menu, álbum e Maria. Além disso, capturas de retrato, acessibilidade e percurso físico nas escadas.

| Vista | Antes | Depois |
|---|---|---|
| Menu | [1.15](captures/aurora12/menu-before.png) | [1.2](captures/aurora12/menu-after.png) |
| Álbum | [1.15](captures/aurora12/album-before.png) | [1.2](captures/aurora12/album-after.png) |
| Maria | [1.15](captures/aurora12/maria-before.png) | [1.2](captures/aurora12/maria-after.png) |
| Sala de aula | [1.15](captures/aurora12/classroom1-before.png) | [1.2](captures/aurora12/classroom1-after.png) |
| Quadra interna | [1.15](captures/aurora12/court-interior-before.png) | [1.2](captures/aurora12/court-interior-after.png) |
| Escadas | [1.15](captures/aurora12/stairs-before.png) | [1.2](captures/aurora12/stairs-after.png) |

[Percurso real no meio da escada](captures/aurora12/stairs-traversal-after.png) · [Terceiro pavimento durante o teste](captures/aurora12/hall-traversal-after.png) · [Menu em retrato](captures/aurora12/menu-portrait-after.png).

## Custo de renderização e desempenho

Ambiente: Linux, Node 24.22.1, Google Chrome for Testing 158.0.8127.18, ANGLE/SwiftShader. Toque e viewport Android emulados. Não houve aparelho físico.

Capturas: 915×412 CSS, DPR 1, preset Baixo, sombras e resolução adaptativa desligadas. Os 15 pares controlados apresentaram **+1 draw call, +1 geometria e nenhuma textura adicional**. Triângulos adicionais: 48 a 3.184 conforme os pavimentos visíveis, incluindo os props. O lote de contatos possui até sete instâncias de 16 triângulos, sem física ou raycast.

Perfil: quatro janelas de pelo menos 60 segundos por versão, DPR 0,5, câmera e configurações iguais. NPCs e carregamento progressivo permaneceram ativos. Valores abaixo em milissegundos, antes → depois:

| Cenário | Frame P50 | Frame P95 | Frame P99 | Atualização CPU P95 |
|---|---:|---:|---:|---:|
| Campus | 383,3 → 400,1 | 766,6 → 816,7 | 949,9 → 916,7 | 6,7 → 6,3 |
| Quadra | 599,9 → 550,1 | 1.250,0 → 1.133,3 | 1.516,7 → 1.216,6 | 18,9 → 7,6 |
| Sala de aula | 266,7 → 266,7 | 499,9 → 500,0 | 583,3 → 616,7 | 7,7 → 14,8 |
| Biblioteca | 266,7 → 250,0 | 533,4 → 483,3 | 649,9 → 533,4 | 7,6 → 8,9 |

O renderizador de software é lento e apresentou variação nos dois sentidos. Esses dados **não demonstram ganho de FPS em Android** nem eliminação de microtravamentos. A atualização CPU P95 aumentou na sala e na biblioteca; exige confirmação em GPU física. Na janela longa da biblioteca, o estado final variou de 164 para 174 chamadas e de 26 para 27 texturas enquanto pavimentos/NPCs eram carregados. Essa variação de streaming não aparece nos pares de capturas controlados; não foi atribuída apenas ao novo lote.

[Dados completos JSON](AURORA_12_METRICS.json) · [Tabela CSV](AURORA_12_METRICS.csv).

Seis ciclos de abertura de álbum/menu no teste de navegador mantiveram as contagens de geometrias e texturas. Os recursos próprios do novo InstancedMesh, geometria e material têm liberação idempotente testada; não foi realizado ensaio prolongado de heap em aparelho físico.

Bundle principal gzip: 191,22 → 192,50 kB; CSS gzip: 12,37 → 13,12 kB. Nenhuma dependência adicionada. Permanece o aviso anterior do Vite sobre chunks maiores que 500 kB.

## Testes realizados

- `npm run test:unit`: **267 aprovados, 0 falhas**. Inclui narrativa, saves, puzzles, materiais, apoios, sinalização, escadas e navegação existentes; novos testes de contatos, coordenadas, liberação de recursos e preferências.
- `npm run build`: aprovado.
- Oito fluxos únicos de Playwright aprovados após correção de duas fixtures, sem alterar suas verificações de comportamento. A execução inicial teve 6/8; foram repetidos apenas os casos afetados.
- Auditoria dos builds congelados: 18 pares visuais, verificação de cinco ações, três opções de Maria, categorias do álbum, retrato e persistência das preferências; nenhum erro de runtime nas capturas.

| Fluxo de navegador | Resultado |
|---|---|
| Rever capítulo e restaurar escolhas/recibos sem nova recompensa | Aprovado |
| Duas conversas casuais distintas, progresso intacto e controle restaurado | Aprovado após correção da posição inicial da fixture |
| Cinco ações, três opções de Maria e três categorias do álbum | Aprovado |
| Explorar, recarregar e retomar campanha | Aprovado |
| Save antigo com memórias esparsas e missões futuras em andamento | Aprovado |
| Ler álbum na tela inicial sem iniciar próxima missão | Aprovado |
| Subir, inverter, salvar/recarregar no meio, alcançar terceiro piso e descer fisicamente | Aprovado |
| Preferências persistentes, teclado, toque, três presets e seis ciclos de painéis | Aprovado após restaurar o leitor de diagnóstico no teste após reload |

Comandos de navegador:

```sh
npx playwright test tests/narrative-ux115.spec.js tests/journey115-review.spec.js tests/ultimate-colorbeat12.spec.js tests/physical-world092.spec.js --workers=1
npx playwright test tests/ultimate-colorbeat12.spec.js tests/journey115-review.spec.js --grep='visual accessibility|casual Maria' --workers=1
npx playwright test tests/journey115-review.spec.js --grep='casual Maria' --workers=1
```

A fixture antiga de Maria falhou também no build 1.15 congelado: ela retomava a caminhada e saía do alcance entre o prompt e o segundo toque. O teste agora inicia o jogador 0,6 unidade mais próximo, mantendo NPC em circulação e todas as verificações originais de duas conversas, variedade, progresso e controles. Não foi alterado o comportamento do jogo para satisfazer o teste. `scripts/check-maria12.mjs` registra essa comparação.

## Saves e conteúdo

Nenhuma migração de campanha. A chave e o formato do save foram mantidos. Apenas duas preferências booleanas opcionais foram adicionadas à validação; saves antigos recebem padrões compatíveis.

Arquivos de dados narrativos, datas, textos, IDs, personagens/modelos, missões, recompensas, rádios e controles não foram reescritos. A arquitetura, portões, pisos e navegação permanecem. Não foi reexecutada nesta rodada toda a campanha manual do início ao fim; houve regressão unitária completa e os oito fluxos de navegador descritos acima.

## Limitações e checklist Android físico

- Validar no Galaxy S24 Ultra e em aparelho mais modesto: paisagem, multitouch com joystick/câmera/correr, três presets, leitura de diálogos e álbum, rádios e retorno após minimizar o Chrome.
- Caminhar campus → recepção → três pisos → quadra; conferir contatos no chão e ausência de placas planas nas escadas.
- Alternar movimento reduzido/efeitos, recarregar e confirmar persistência. Conferir campanha, inventário e recompensas no save existente.
- Jogar por pelo menos dez minutos e observar engasgos, aquecimento, nitidez e memória. Não há medição física de FPS nesta entrega.
- Há pontilhado discreto em uma parede da quadra nas capturas de SwiftShader, também presente na base. A causa não foi confirmada; comparar em GPU real antes de alterar a geometria.
- Os contatos gráficos não são sombras projetadas fisicamente; nas escadas são ocultados para preservar a leitura dos degraus.

Para teste local, atualizar esta branch no clone existente, executar `npm ci` e `npm run dev -- --host 0.0.0.0`. Abrir `http://IP_DO_COMPUTADOR:5173` no Android na mesma rede. O site público continua na versão anterior até autorização de publicação.

[Lista completa dos arquivos](AURORA_12_FILES.txt). Scripts de auditoria mantidos em `scripts/audit-aurora12*.mjs` e `scripts/report-aurora12.mjs`; builds congelados e logs locais em `work/aurora12`.
