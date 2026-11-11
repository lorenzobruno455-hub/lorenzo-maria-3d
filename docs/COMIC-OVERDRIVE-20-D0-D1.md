# Comic Overdrive 2.0 — bloco 0–1 / D0 e D1

## Limite desta entrega

Brief integral: PDF do proprietário `PROJECT_AURORA_COMIC_OVERDRIVE_2_0_SAO_JORGE_CODEX.pdf`, cinco páginas, 10/11/2026. Revisado em 11/11/2026. O pedido mais recente agrupa fases **0–1, 2–3, 4–5**. Esta entrega para em D1: auditoria e demonstração reversível A/B de pigmentos, bandas e contornos selecionados. A expansão dos contornos pertence à Fase 2; a revisão individual dos ambientes à Fase 3; fachada/quadra/entrada à Fase 4. Nenhum movimento de porta, parede, colisor ou ponto de save é autorizado por uma ilustração.

## D0 — GitHub como fonte de verdade

Consulta nova às branches, PRs e Actions em 11/11/2026: base `feat/aurora-comic-overdrive-p3-p4`, `5d32b5ddc8bb36fe6fdc232d5680b8835e708f0d`, PR #15 ainda aberto, não mesclado. [CI 42943074929](https://github.com/lorenzobruno455-hub/lorenzo-maria-3d/actions/runs/42943074929) concluído com sucesso: 159 testes unitários e 91 de navegador. `main` permanece em `f05e1c0`. Branch nova: `feat/aurora-comic-overdrive-20-d1`.

P3/P4 é uma entrega implementada e validada automaticamente; teste físico Android/Chromebook ainda não foi informado. O site público não representa essa branch. Este trabalho não publica nem mescla as entregas anteriores.

## Mapa de código e diagnóstico

| Área | Arquivos reais | Achado / risco |
| --- | --- | --- |
| Pigmentos e shaders | `colorbeat-materials.js`, `comic-overdrive-p0.js` | Colorbeat usa albedo/vertex colors lineares, texturas sRGB e ramp de dados lineares. O Overdrive P3/P4 converte neutros claros em `coPaper`, independentemente de piso/parede; isso funde superfícies diferentes. Não há evidência de uma dupla conversão sRGB no caminho auditado. |
| Saída e luz | `src/main.js`, `colorbeat-lighting.js`, `atmosphere.js`, `school-lighting.js` | Saída sRGB, ACES Filmic, exposição 1. Pigmento claro multiplicado por 1,2 sofre compressão de highlights no ACES. A banda antiga depende da energia direta acumulada, incluindo fills; faces distintas podem cair na mesma banda clara. |
| Fontes de luz | mesmos arquivos | Um sol direcional com shadow map por preset; hemisfério; fills não sombreados do campus; escola com dois fills no máximo, ambiente fraco, segundo fill desativado no Baixo. Não criar nova luz/postprocess para D1. |
| Tinta | `ink-outlines.js`, `actor-ink-material.js`, `outline-manager.js` | Tinta arquitetônica/furniture selecionada nasce com opacidade 0,48. Actor shells já preservam skinning e projetam largura em pixels. `outline-manager.js` é mecanismo anterior; não duplicar os personagens. |
| Escola | `school-architecture.js`, `school-materials.js`, `school-furniture.js`, `school-living-details.js` | Estrutura, pisos e tetos claros; rodapés/quinas e objetos adjacentes precisam maior separação. Atlas de textos existentes são compactos e devem ser preservados. Linhas de parede/móveis podem sumir no Baixo. |
| Mundo e entrada | `world.js`, `campus-connection.js`, `continuous-school.js`, `school-entrance.js`, `world-coordinates.js`, `school-navigation.js` | Mesma cena, origem São Jorge `(60,0,0)`, entrada atual `(60,19)`, vão 2,6 × 2,6 em unidades de jogo. Prefetch a 18; detalhe a 15; colisão de piso ativa e portão de streaming existentes. Não alterar em D1. |
| Proxy externo | `campus-connection.js` | Três caixas claras, janelas laterais e cobertura plana simplificada; não reproduz ainda a fachada fotográfica, a grade frontal ou a quadra anexa. Não confundir proxy com levantamento real. |
| Quadra atual | `campus-world.js` | Quadra pequena no campus antigo, centro `(-33,4)` em X/Z. Não é a quadra anexa fotografada; preservá-la e tratar novo anexo na Fase 4. |
| Recursos/presets | `resources.js`, `quality.js`, `batching.js` | Geometrias, materiais, ramp e texturas compartilhados. DPR máximo 1 / 1,35 / 1,75; sombras 0 / 1024 / 2048. Preservar streaming e descarte. |

Os caminhos acima pertencem a `src/systems/`, salvo indicação diferente. Nenhum arquivo foi presumido pelo nome do briefing.

## Proveniência arquitetônica

| Detalhe | Estado | Consequência |
| --- | --- | --- |
| Massa alongada, três níveis aparentes, fileiras de janelas, faixa rosa superior e azul intermediária, parede clara, grade branca e letreiro superior | OBSERVADO na fotografia A do PDF | Referência de identidade para modelagem da Fase 4. D1 somente experimenta as faixas sobre os volumes atuais. |
| Volume anexo à direita da foto, parede azul e cobertura avermelhada | OBSERVADO | Não inferir dimensões reais, vigas internas ou acesso a partir da ilustração. |
| Entrada funcional lateral junto à quadra | INFORMADO PELO USUÁRIO no PDF | A posição exata precisa ser resolvida no croqui ou no render anotado em D3 antes de mudar navegação. |
| Coordenadas exatas da porta, estrutura interna da cobertura, texto secundário completo, proporções reais e orientação da foto no mundo do jogo | INDETERMINADO | Sem mudança de porta/colisores/saves neste bloco. A porta azul visível na foto não prova ser a entrada principal. |
| Organização dos 24 ambientes, lados e salão superior | Documentação/croquis já implementados, unidades adaptadas ao jogo | Preservar matriz; não tratar coordenadas do JSON como medidas levantadas na escola real. |
| Saturação extrema, tinta, sombras gráficas | Conceito B, referência de estilo | Não copiar portão, brasão, texto pequeno, vigas amarelas ou proporções do conceito. |

## Inventário de ambientes / próxima intervenção

Matriz de verdade: [SAO_JORGE_ROOM_MATRIX.md](SAO_JORGE_ROOM_MATRIX.md), conferida contra `src/data/sao-jorge.json`: **12 + 11 + 1 = 24 ambientes**. Nenhum ambiente novo.

| Piso | Ambientes | Achado e destino |
| --- | --- | --- |
| 1º | Salas A/B/C | Mesmo acabamento claro; separação piso/parede, carteiras/fundo e quinas em Fases 2–3; Sala A é amostra D1. |
| 1º | Banheiros masculino/feminino, escadas | Preservar acessos; revisar leitura de azulejos, degraus e volumes em Fases 2–3. |
| 1º | Professores, biblioteca | Papel e madeira tendem à banda clara; preservar seis livros interativos; auditoria visual própria na Fase 3. |
| 1º | Cinema, recepção, secretaria, direção | Preservar projeção, objetos, NPCs e interações; contraste e sombras de contato na Fase 3. |
| 2º | Salas A/B/C/D/E | Mesmo risco de neutros fundidos; Sala C é segunda captura clara de baseline. |
| 2º | Banheiros masculino/feminino, escadas | Mesma revisão visual por piso, sem mudar transições existentes. |
| 2º | Ciências, coordenação, laboratório | Manter equipamento e missões; revisar branco/vidro/metal separadamente. |
| 3º | Salão multiuso | Piso extenso claro e pouca separação entre faces; manter espaço livre, sem palco/foyer inventado. |

## Plano de risco e economia

1. D0: dez capturas reais com condições registradas; um commit de auditoria.
2. D1: duas alternativas opcionais por query, sem substituir o padrão P3/P4 antes da escolha. Reusar decorator, materiais e streaming; apenas protótipo de tinta estrutural selecionada. Testes focados de shader/restauração, browser e build; segundo commit.
3. Parar para escolha visual e permissão para o bloco 2–3. Não executar regressão geral agora; reservada ao fechamento da Fase 5. Não revalidar repetidamente sistemas intocados.
4. Não alterar sete GLBs/rigs, seis memórias/textos/datas, missões, save v04/checkpoint, câmera/física, controles, PWA, main ou site publicado.

## Capturas de baseline

Reprodução: `node scripts/capture-overdrive-20.mjs baseline` com Vite na porta 5173 e Chromium instalado. Mesma restauração v04, 960×600, Médio, sombras ligadas, exposição 1, adaptive desligado, manhã, reduced motion. Estado completo por cena em [baseline-metrics.json](captures/comic-overdrive-20/baseline-metrics.json). Temporização em Chromium/SwiftShader é de software, não FPS de telefone.

| Cena | Captura P3/P4 |
| --- | --- |
| Fachada/proxy atual | [JPEG](captures/comic-overdrive-20/facade-baseline.jpg) |
| Campus | [JPEG](captures/comic-overdrive-20/campus-baseline.jpg) |
| Céu / árvore | [JPEG](captures/comic-overdrive-20/sky-tree-baseline.jpg) |
| Sala clara 1 — A, 1º andar | [JPEG](captures/comic-overdrive-20/classroom-a-baseline.jpg) |
| Sala clara 2 — C, 2º andar | [JPEG](captures/comic-overdrive-20/classroom-c-baseline.jpg) |
| Corredor do 1º andar | [JPEG](captures/comic-overdrive-20/corridor-baseline.jpg) |
| Biblioteca | [JPEG](captures/comic-overdrive-20/library-baseline.jpg) |
| Laboratório | [JPEG](captures/comic-overdrive-20/laboratory-baseline.jpg) |
| Salão do 3º andar | [JPEG](captures/comic-overdrive-20/hall-baseline.jpg) |
| Entrada atual / região sem anexo | [JPEG](captures/comic-overdrive-20/entrance-court-baseline.jpg) |

O nome `entrance-court` identifica a região de auditoria, não uma quadra anexa já implementada. A quadra real da fotografia ainda é trabalho da Fase 4.

## D1 — duas propostas reais, aguardando aprovação

| Proposta | Decisão artística | Como abrir com Vite |
| --- | --- | --- |
| **A — Tinta solar (recomendada)** | Verde intenso, caminhos/piso frio azul, paredes claras quentes, faixas rosa/azul na massa existente, sombras cromáticas e tinta de 2,2 pixels CSS. Mantém melhor leitura luminosa. | `http://localhost:5173/?comic=overdrive-20-a` |
| **B — Sombra elétrica** | Piso violeta, meios-tons mais escuros, contraste quente/frio mais teatral e tinta de 2,8 pixels CSS. | `http://localhost:5173/?comic=overdrive-20-b` |

Sem query, o padrão continua P3/P4. As queries anteriores continuam válidas. As duas propostas já afetam os materiais toon compartilhados, inclusive novos pisos carregados; a expansão/revisão individual ainda aguarda o próximo bloco. Não há preferência nova gravada no save.

Diagnóstico aplicado: as propostas mantêm saída sRGB e exposição 1, mas usam **NoToneMapping** para evitar a compressão de pigmentos pelo ACES; não é um filtro de saturação. Os shaders continuam calculando três bandas: orientação da normal no mundo separa faces mesmo com vários fills, e energia da luz direta participa do escurecimento. Pisos frios se distinguem de madeira em móveis e paredes quentes. Peles/cabelos/olhos conservam os perfis dedicados; vidro e atlas de texto não entram no novo remapeamento.

Protótipo de tinta: `LineSegments2`/`LineMaterial` já distribuídos com Three.js, um batch por root externo ou piso detalhado, largura em tela, depth test ligado, sem sombras ou raycast. Usa arestas reais acima de 38° na estrutura e os segmentos de móveis já selecionados no código existente. Herda a visibilidade dos proxies/pisos. Permanece no Baixo. Não traça diagonais da triangulação. Uma primeira medição revelou custo excessivo ao incluir todos os bevels/micro-objetos; a seleção foi reduzida antes da entrega. A cobertura universal de silhuetas e quinas ainda pertence à Fase 2.

As faixas de fachada são **estudos de cor nos volumes existentes**, não reconstrução fotográfica. Grade, anexo esportivo e entrada lateral continuam pendentes da Fase 4 / D3. Nenhum detalhe da ilustração foi tratado como medida ou infraestrutura comprovada.

### Quatro comparativos reais

Capturas integrais sem retoque. As pranchas apenas organizam os JPEGs e seus títulos; não são imagens geradas.

| Cena | Antes × A | Antes × B | Antes / A / B |
| --- | --- | --- | --- |
| Fachada atual | [Comparativo 1](captures/comic-overdrive-20/facade-a-comparison.jpg) | [Comparativo 2](captures/comic-overdrive-20/facade-b-comparison.jpg) | [Prancha](captures/comic-overdrive-20/facade-comparison.jpg) |
| Sala A, 1º andar | [Comparativo 3](captures/comic-overdrive-20/classroom-a-a-comparison.jpg) | [Comparativo 4](captures/comic-overdrive-20/classroom-a-b-comparison.jpg) | [Prancha](captures/comic-overdrive-20/classroom-a-comparison.jpg) |

Mesmo viewport, preset, sombras, exposição, horário 08:15, posição e câmera. Diferença máxima de câmera <0,00003 unidade; fachadas com câmera idêntica. Animações idle podem variar. A captura da fachada foi reenquadrada mais longe após D0 para incluir as faixas superiores; as três versões finais usam o mesmo enquadramento corrigido.

Reprodução: servidor Vite ativo; `node scripts/capture-overdrive-20.mjs a`, depois `node scripts/capture-overdrive-20.mjs b`. Relatório: `python scripts/report-overdrive-20.py` com Pillow/numpy/matplotlib do ambiente de desenvolvimento, sem adicionar dependências ao jogo. Arquivos de captura registram o HEAD D0; A/B foram renderizados na árvore de trabalho D1. [Hashes SHA-256 dos arquivos do renderizador](captures/comic-overdrive-20/render-source.json) identificam essa fonte.

### Luminância e custo

[Histograma](captures/comic-overdrive-20/luminance.png) e [dados](captures/comic-overdrive-20/luminance.json): JPEG convertido de sRGB para linear, luminância Rec.709; recorte fixo `(280,80)–(940,440)`, excluindo a maior parte do HUD. Não é avaliação automática de qualidade nem prova de fidelidade arquitetônica.

| Cena | Média antes / A / B | P10–P90 antes | P10–P90 A | P10–P90 B |
| --- | --- | --- | --- | --- |
| Fachada | 0,534 / 0,424 / 0,387 | 0,223–0,670 | 0,127–0,877 | 0,110–0,724 |
| Sala A | 0,525 / 0,526 / 0,321 | 0,076–0,737 | 0,091–0,880 | 0,084–0,463 |

Na sala, A conserva a luminância média e muda a distribuição/pigmentação; B escurece deliberadamente o ambiente. A intensidade não se resume a aumentar brilho. Pixels quase brancos acima de 0,95 representam menos de 0,1% do recorte nas quatro propostas capturadas.

| Cena | Draw calls antes → A/B | Triângulos antes → A/B | Geometrias antes → A/B | Texturas residentes antes → A/B |
| --- | --- | --- | --- | --- |
| Fachada | 94 → 97 | 165.592 → 168.184 (+1,6%) | 126 → 129 | 13 → 13 |
| Sala A | 88 → 89 | 122.762 → 129.674 (+5,6%) | 157 → 160 | 18 → 20 |

O protótipo não aloca texturas novas; materiais/atlas de outras partes chegam de forma assíncrona e afetam a residência medida. Os JSONs registram também shaders e oito amostras de frame time de cada cena. **SwiftShader/software, não benchmark Android:** médias fachada antes/A/B 812/408/425 ms; sala 621/798/940 ms. Não atribuir a oscilação a ganho/regressão de GPU física: amostra curta, software e carga do ambiente variáveis. Teste em S24 Ultra/A35/Chromebook continua pendente de execução real.

### Verificação executada e continuidade

- **10 testes unitários direcionados aprovados**: composição/restauração de shaders, atlas/vidro preservados, propriedade/descarte da tinta, transforms/culling e regressões dos decorators P0–P4.
- **2 testes de navegador aprovados**, uma opção A/B por teste: shaders reais, toque CDP, caminhada, preset Baixo, tinta mínima e recarga v04. As quatro capturas finais também validam compilação da fachada e da sala sem erros de página/console. O ajuste posterior de seleção de arestas foi coberto pelos unitários e pelas capturas; não se repetiu toda a suíte de controles.
- **Build de produção aprovado**. JS principal 411,31 kB / 115,38 kB gzip; núcleo Three 573,26 / 149,02 kB; CSS 47,41 / 9,93 kB. O aviso de chunk >500 kB já existia. Sem nova dependência npm.
- `git diff --check` aprovado. Sem alteração em GLBs, dados narrativos, memórias, progress/checkpoint, navegação/colisão, controles ou PWA. Nenhuma suíte geral repetida: regressão completa reservada à Fase 5.

**Ponto de retomada:** escolher A ou B e obter autorização para o bloco **2–3**. Reusar este inventário e as verificações registradas, conferindo apenas se houve novos commits no GitHub. Fase 2 amplia contornos e verifica legibilidade entre materiais próximos; Fase 3 revisa profundidade de cada sala, corredor, biblioteca, laboratório e salão. As novas referências de UI/cinematics estão registradas em [REFERENCIAS-HIFI-RUSH.md](REFERENCIAS-HIFI-RUSH.md), para Fase 5. Não avançar para reconstrução da fachada/quadra ou mudança da entrada neste bloco.
