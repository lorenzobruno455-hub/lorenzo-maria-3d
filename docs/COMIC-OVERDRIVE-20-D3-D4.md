# Comic Overdrive 2.0 — fases 4–5

Base GitHub: PR #17, `086f2bc`. Branch `feat/aurora-comic-overdrive-20-d3-d4`, PR #18. Proposta B e pisos marrom escuro/cinza mantidos. Sem merge ou publicação.

## Fase 4 — implantação confirmada

O proprietário confirmou três portões: externo da quadra; portão existente da escola **dentro da quadra**; entrada voltada ao campus antigo que **abre diretamente na recepção**. A quadra é colada à escola. Esta correção substitui a proposta preliminar de afastamento registrada em `6abb9cd`; as capturas antigas em `comic-overdrive-20-d4/` são históricas.

Para orientar a recepção ao campus, aplicou-se uma rotação rígida de 180° ao prédio na origem `(60,0,0)`. Não houve espelhamento, troca de salas ou mudança nos croquis/GLBs. Transformação: `mundo=(60-localX, localY, -localZ)`. As coordenadas locais dos 24 ambientes, personagens e saves internos continuam iguais. A face da foto é tratada como face da rua, oposta ao campus; isso é adaptação de implantação no jogo, sem afirmar orientação geográfica real.

| Acesso | Coordenadas locais X/Z | Mundo X/Z | Destino |
| --- | --- | --- | --- |
| G1 | −11; 27 | 71; −27 | Exterior → quadra |
| G2 | 0; 19 | 60; −19 | Quadra → corredor existente |
| G3 | 11; −5,5 | 49; 5,5 | Campus → recepção diretamente |

Quadra no mundo `X=49…71,Z=−35…−19`, encostada no prédio em `Z=−19`. Caminho cinza pelo lado do campus e contorno norte levam aos acessos. O limite norte foi ampliado para `−37` somente no distrito novo; a antiga borda do campus continua protegida. Árvores, bancos, postes e edifícios antigos mantêm suas posições.

A parede externa da recepção ganhou um vão estreito de 2,6 unidades, com verga, identificação e batentes. A janela desse trecho foi substituída pelo acesso. O portão G2 e o vão original permanecem. Os três portões reutilizam o sistema existente de pivô, animação e colisão; não entram na lista persistente das duas portas antigas. G1 abre por proximidade; G2/G3 aguardam a chegada do piso carregado. Selos físicos impedem entrar antes disso.

Fachada procedural: massa de três níveis, faixas rosa e azul, paredes claras, janelas, grade branca, letreiro; quadra azul com cobertura curva avermelhada. Sem emblema copiado, infraestrutura amarela inventada, modelo externo ou dependência nova. Geometrias/materiais compartilhados e batches estáticos; um atlas de letreiro/recepção 512×128. A camada exterior deixa de renderizar em inspeção e nos interiores afastados dos portais.

[Vista da fachada](captures/comic-overdrive-20-d4-confirmed/overview-annotated.png) · [Os três portões](captures/comic-overdrive-20-d4-confirmed/entry-annotated.png).

As imagens são capturas reais, com pontos projetados a partir da câmera real. A segunda usa um corte **somente na revisão**, ocultando a cobertura da quadra para mostrar G2. O jogo mantém a cobertura. Queries históricas conservam sua orientação antiga para comparação; o padrão e a prévia confirmada usam a implantação nova.

## Compatibilidade

Mundo contínuo na mesma cena, sem teletransporte. Vetores de movimento, colisores e yaw da câmera são transformados entre os referenciais; mudar de parent preserva a pose mundial. Saves v04 não são migrados: posições internas permanecem locais e externas permanecem mundiais. Só o pequeno vão da recepção amplia a validação de posição. Um save externo antigo sobre a parede da porta anterior é recuperado no entorno livre, sem cair em uma sala ainda descarregada. Sete personagens, seis memórias, missões, três pavimentos, checkpoint e controles permanecem sob os sistemas existentes.

## Fase 5 — revisão e validação

Acabamento original dos painéis com áreas diagonais, cores de impressão, títulos marcados, seleção amarela e hierarquia de leitura, a partir das referências registradas em [Referências Hi-Fi RUSH](REFERENCIAS-HIFI-RUSH.md). Nenhum asset copiado. Alvos de toque e controles não foram recortados; reduced motion e alto contraste mantidos. A página Behance integral permaneceu indisponível (403); não se atribuem detalhes não inspecionados a ela.

[Dez cenas finais](captures/comic-overdrive-20-d5/final-metrics.json): campus, árvores/céu, salas A e C, corredores dos dois pisos, biblioteca, laboratório, salão e quadra antiga. São renders reais de 960×600, preset Médio, sem erro de página/shader. A auditoria dos 24 ambientes da fase 3 continua válida para a decoração; esta fase mantém seus dados e posições locais. Os dois exteriores anotados complementam esse conjunto.

[Comparação anterior](captures/comic-overdrive-20-d3/after-metrics.json) → [final](captures/comic-overdrive-20-d5/final-metrics.json), mesmas poses locais/preset, com a iluminação mundial incidindo no prédio agora girado:

| Cena | Draws antes → depois | Triângulos antes → depois |
| --- | --- | --- |
| Campus | 220 → 243 | 242.598 → 247.116 |
| Sala A | 90 → 87 | 136.440 → 134.798 |
| Biblioteca | 151 → 154 | 157.096 → 157.386 |
| Salão | 77 → 79 | 62.320 → 62.524 |
| Quadra antiga | 131 → 131 | 187.914 → 187.914 |

A fachada aumenta o custo exterior; a camada é ocultada nos interiores afastados dos portais. Os JSONs registram também geometrias/texturas e amostras de tempo. Contagens com sombras incluem passes de renderização. Amostras curtas de SwiftShader, algumas com carga concorrente de captura, servem à auditoria e **não são benchmark de desempenho**.

[Presets móveis e interface](captures/comic-overdrive-20-d5/ui-metrics.json): 844×390 com sete GLBs carregados, Baixo/Médio/Alto; pausa, diálogo, inventário e retrato 390×844 com alto contraste/reduced motion. A cinemática tem captura real separada. Sem erros de página/console. Nenhum limiar de draw calls ou de tempo individual dos testes foi ampliado.

Verificações locais: 17 unitários direcionados finais passaram; outros testes de navegação, compatibilidade e NPCs passaram durante a implementação. Browser: prévia/padrão com mesma colisão/campanha, caminhada pelos três portões, save externo/recarga, recuperação do save da porta antiga e retorno ao campus passaram. A jornada foi dividida em ida e volta para não ultrapassar o limite individual de 240s no renderizador de software. Uma primeira execução concorrente do teste de menus atingiu 90s; a regressão final validará seu estado definitivo. Build de produção aprovado; aviso preexistente de chunk Three acima de 500 kB mantido.

Revisão independente final: nenhum problema crítico, importante ou menor identificado. Ela verificou a árvore de trabalho completa, incluindo transformação, portas, streaming, saves, recursos e UI. Desempenho físico, geografia não comprovada pelas referências e resultado de CI permanecem explicitamente fora de sua conclusão técnica.

**Regressão completa:** execução final em quatro shards disjuntos do workflow existente, pendente de resultado. O workflow agora inclui a base deste PR; atualizações apenas de documentação não repetem toda a suíte. FPS físico Android permanece pendente de teste em aparelho; tempos de SwiftShader não equivalem a FPS de telefone.
