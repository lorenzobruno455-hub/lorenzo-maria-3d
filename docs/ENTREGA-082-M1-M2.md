# Living School 0.8.2 — M1 e M2

Entrega parcial: salas, sinalização, corredores e biblioteca. Branch `feat/aurora-082-living-school`, baseada em `50db300213cef648aa2ade04e90acd5caf3cf999` (0.8.1 validada pelo CI 42722179611). Não conclui M3/M4. A main, a conexão física 0.9 e a expansão 1.0 não foram alteradas. A publicação PWA no Sites é separada desta entrega.

## Auditoria e inventário

Fonte estrutural: [matriz existente](SAO_JORGE_ROOM_MATRIX.md), `src/data/sao-jorge.json`, três GLBs já existentes e construções M2. São 24 ambientes, sem reorientar salas: 12 no primeiro piso, 11 no segundo e salão no terceiro. As malhas de móveis reais decodificam 581, 419 e 6 caixas respectivamente. A biblioteca já possuía estantes, livros e duas mesas; salas já possuíam mesas, cadeiras, lousas e armários. Foram reaproveitados, não reconstruídos. As capturas iniciais registram também laboratório, recepção, professores e salão, sem antecipar o acabamento M3/M4.

| Ambientes / IDs | Situação inicial e entrega |
|---|---|
| Salas `sj-f1-01`, `sj-f1-07`, `sj-f1-08`, `sj-f2-01`, `sj-f2-02`, `sj-f2-07`, `sj-f2-08`, `sj-f2-11` | Apenas um tampo por sala recebia decoração; paredes nuas e lousas sem conteúdo. Papelaria em várias mesas, variações determinísticas, estojos, folhas, garrafas, lousa escrita, agenda, mapas esquemáticos, relógio e murais de turma. Posições de carteiras e cadeiras preservadas. |
| Corredores dos pisos 1/2 | Sinalização pelo verso e paredes pouco informativas. Placas orientadas para o leitor, murais distribuídos em trechos sólidos, bebedouros rasos e vasos suspensos dentro da margem de colisão já existente. Luminárias, batentes, escadas e aberturas existentes preservados. |
| Biblioteca `sj-f1-06` | Estantes com livros uniformes e mesas pouco compostas. Preenchimento parcial das lacunas com variação de altura/largura/cor; cadernos, marcadores, luminária decorativa e murais. Seis livros narrativos e encenação do quebra-cabeça preservados. |
| Banheiros `sj-f1-02/03`, `sj-f2-03/04` | Mobiliário e painéis conceituais existentes mantidos; placa de identificação corrigida. Não se presume instalação real nova. |
| Escadas `sj-f1-04`, `sj-f2-05` | Transições por patamar e marcadores preservados. Nenhum móvel novo na passagem. |
| Professores `sj-f1-05`; cinema `sj-f1-09`; recepção `sj-f1-10`; secretaria `sj-f1-11`; direção `sj-f1-12`; ciências `sj-f2-06`; coordenação `sj-f2-09`; laboratório `sj-f2-10` | Identificação corrigida globalmente. Mobiliário/decoração existente mantidos; acabamento específico permanece no M3. |
| Salão `sj-f3-01` | Placa e atlas corrigidos; layout mantido, sem palco/foyer. Composição multiuso permanece M4. |

## Causas dos quadros/placas

- **Orientação:** placas nas portas em X tinham a normal voltada para a parede. `DoubleSide` mostrava o verso e podia espelhar o texto. A correção usa normal voltada ao corredor e `FrontSide`, com teste de raio da posição de leitura.
- **Posicionamento:** afastamentos mínimos foram substituídos por separação explícita da face dos colisores, sem desenhar por cima das paredes nem desativar profundidade. Um apoio sólido conecta as lousas herdadas à parede; a superfície original é preservada.
- **Atlas/proporção:** painéis altos compartilhavam faixas de 512×32, esticando texto verticalmente. Faixas com proporção por painel e borda de um pixel mantêm UVs dentro da área pintada. Uma textura compacta por pavimento; relógios e cartazes menores usam resolução menor, sem mipmaps cruzando células. Os limites são testados.
- Não foi encontrada necessidade de reexportar GLBs, inverter normais do prédio, mover paredes ou alterar a câmera. Os mapas são esquemas didáticos originais, sem alegar representação cartográfica precisa.

## Biblioteca reutilizável e preservação

`createSchoolFurniture` continua proprietário dos buffers de acabamento e empresta geometrias/materiais de Resources. Helpers locais de caderno e garrafa e chamadas da fábrica existente produzem papelaria, estojos, luminária e livros. Tudo é agrupado pelos materiais existentes; não se cria GLB por prop. `createSchoolArchitecture` reutiliza seu atlas para placa, mural, mapa, agenda e relógio. Sem novas dependências ou assets externos; arte procedural original, mesmas licenças existentes.

Os props ficam dentro do tampo/estante original. Livros adicionais são rejeitados quando intersectam volumes existentes. A camada decorativa respeita uma reserva de 0,27 ao redor dos pontos narrativos na mesma altura, consultando `NARRATIVE_POINTS` e `bookPoint` existentes; não duplica coordenadas das missões. Props empilhados somente são adicionados quando há apoio abaixo. Pequenos detalhes não acrescentam colisores nem sistemas de navegação.

Sete personagens, clipes, seis memórias, missões, rotinas, controles, carregamento por pavimento, inspeção, qualidade e schema v04 não foram modificados. Nenhum texto ou data narrativa foi alterado. Os adereços não recebem interações novas que disputem o alvo dos livros.

## Capturas e métricas

Capturas reais em Chromium/SwiftShader, 960×600, preset Médio, mesmas posições/yaw/pitch antes/depois. PNGs originais convertidos para JPEG de qualidade 85 apenas para armazenamento econômico, sem mudar composição. Poses/NPCs variam por simulação. `before` usa 0.8.1; `after` mostra M1+M2. HUD oculto só nas capturas de arte. Baseline extra dos tampos usa a mesma fonte 0.8.1 da hospedagem, com alteração PWA sem efeito no cenário.

| Vista | Antes | Depois |
|---|---|---|
| Sala A / lousa | [Antes](captures/082-m1/class-a-before.jpg) | [Depois](captures/082-m1/class-a-after.jpg) |
| Sala do segundo piso | [Antes](captures/082-m1/class-b-before.jpg) | [Depois](captures/082-m1/class-b-after.jpg) |
| Carteiras / primeiro piso | [Antes](captures/082-m1/class-desks-a-before.jpg) | [Depois](captures/082-m1/class-desks-a-after.jpg) |
| Carteiras / segundo piso | [Antes](captures/082-m1/class-desks-b-before.jpg) | [Depois](captures/082-m1/class-desks-b-after.jpg) |
| Corredor / primeiro piso | [Antes](captures/082-m1/corridor-1-before.jpg) | [Depois](captures/082-m1/corridor-1-after.jpg) |
| Corredor / segundo piso | [Antes](captures/082-m1/corridor-2-before.jpg) | [Depois](captures/082-m1/corridor-2-after.jpg) |
| Biblioteca | [Antes](captures/082-m1/library-before.jpg) | [Depois](captures/082-m1/library-after.jpg) |
| Quadro próximo | [Antes](captures/082-m1/board-before.jpg) | [Depois](captures/082-m1/board-after.jpg) |

Baseline dos próximos marcos: [laboratório](captures/082-m1/laboratory-before.jpg), [recepção](captures/082-m1/reception-before.jpg), [professores](captures/082-m1/teachers-before.jpg), [salão](captures/082-m1/hall-before.jpg).

Reprodução: `CHROMIUM_PATH=/usr/bin/chromium node scripts/capture-living-school082.mjs after` com Vite em 5173. Use `CAPTURE_CASES=library` para uma área e `CAPTURE_URL` para baseline imutável. Dados brutos e tabela: [PERFORMANCE-082-M1-M2.md](PERFORMANCE-082-M1-M2.md). Contadores não são FPS; não houve benchmark em Android físico. Não se promete 30/60 FPS nem redução de draws em todas as vistas.

## Verificação

- 12 testes focados de arquitetura, móveis e Living School aprovados, com GLBs reais, reservas narrativas, suporte/empilhamento, descarte, aberturas e limites de atlas.
- Dois cenários focados de navegador aprovados: save/reload, campanha/retorno, três pavimentos e presets com os limites anteriores. Sem relaxar budgets/asserts existentes.
- Passagem de unitários anterior ao último ajuste de composição: 144/144; build aprovada (84 módulos), com aviso preexistente de chunk Three acima de 500 kB.
- A regressão final completa da cabeça do PR executa unitários, build e todos os cenários de navegador em dois shards disjuntos. Resultado conclusivo nos checks do PR, sem duplicar a execução local.

Limites: relógios são cenográficos, mapas esquemáticos e luminárias de mesa decorativas; nenhum equipamento novo recebe lógica funcional. O escopo M1/M2 não conclui a densidade dos ambientes M3/M4. Revisão visual do autor; nenhuma revisão independente adicional realizada.
