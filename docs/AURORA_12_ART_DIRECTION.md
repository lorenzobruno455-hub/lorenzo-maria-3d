# Aurora 1.2 — Ultimate Colorbeat

Base auditada: `3907bc29` (1.15, `feat/aurora-115-narrative-ux`). Acabamento incremental; nenhuma alteração de arquitetura, missões, diálogos, IDs, recompensas ou navegação.

## Direção de arte

A base já oferece céu gráfico original, vegetação instanciada, contornos de atores, atlas de sinalização, materiais compartilhados e decoração contextual. Esses sistemas foram preservados. O objetivo desta entrega é melhorar integração e leitura, sem acrescentar efeitos de tela caros.

- **Volumes:** as faixas de iluminação existentes agora têm antialiasing por derivadas (`fwidth`). A transição ocupa somente a borda da faixa; mantém áreas sólidas, pigmentos e sombra violeta. Não acrescenta luz, textura nem passe de renderização.
- **Personagens:** contatos gráficos elípticos discretos sob atores próximos. Um único InstancedMesh para até sete personagens, uma geometria de 16 triângulos e um material. Respeitam pavimentos e superfícies externas; são ocultados em escadas e quando não há suporte próximo. Não simulam sombras de luz e não alteram posição, orientação ou colisão.
- **Salas:** variação de capas usando a paleta já compartilhada; pastas e borrachas em cantos livres das carteiras. Objetos apoiados, sem novos colisores. Biblioteca, laboratório, administração, sala dos professores e salão reaproveitam seus conjuntos existentes.
- **Interface:** painéis de papel, tinta escura, detalhes cobalto/coral/turquesa. Cartões do álbum com datas legíveis, abas com estado selecionado claro e colunas responsivas. Menu com faixas coloridas, preservando as cinco ações; diálogo conserva suas três opções. Sem atalhos técnicos novos.
- **Acessibilidade:** movimento reduzido e efeitos de descoberta configuráveis e persistentes. A preferência de movimento do sistema continua prevalecendo. Câmera, cutscenes, digitação, realces, partículas e CSS utilizam a redução adequada, sem remover interações.

## Inventário auditado

| Área | Base observada | Decisão |
|---|---|---|
| Campus e exterior | Pavimento cinza, céu gráfico, fachada colorida | Preservar paleta, arquitetura e iluminação compartilhada |
| Quadra | Piso azul, equipamentos e cobertura vermelha fechada | Preservar; inspecionar também vista interna |
| Recepção | Móveis, computador, documentos e sinalização | Preservar apoios e acessos |
| Corredores dos dois pisos | Placas, portas, murais e piso escuro | Preservar circulação e leitura |
| Duas salas de aula | Carteiras, cadernos, mural e lousa | Acrescentar variação contextual pequena |
| Biblioteca | Livros variados, mesas, luminárias e seis memórias | Preservar objetos e interações |
| Laboratório | Bancadas e equipamentos didáticos | Preservar conjunto procedural |
| Professores | Mesa coletiva e materiais de trabalho | Preservar composição |
| Escadas | Degraus, patamares e guarda-corpos físicos | Não projetar contatos planos sobre degraus |
| Salão | Área multiuso aberta e móveis reversíveis | Preservar espaço livre intencional |
| Jardins | Árvores, canteiros, bancos e perímetro | Preservar instancing e caminhos |

## Protocolo de comparação

Capturas reais do build, 915×412 CSS, DPR 1, Low, sombras e resolução adaptativa desativadas, mesma posição e câmera por par. Atores continuam com suas rotinas: pequenas diferenças de pose/visibilidade não são alterações de cenário. O rádio pode selecionar título diferente por embaralhamento.

Quatro janelas de 60 segundos, DPR 0,5, em Chromium/SwiftShader, câmera fixa, mesmo preset e save de teste. Medidas de software deste ambiente não representam FPS de Galaxy S24 Ultra. NPCs/culling/GC introduzem variabilidade; não atribuir diferenças de recursos globais exclusivamente ao novo código. Build e atividades pesadas separados das janelas de medição.

Resultados, capturas e checklist físico: ver relatório final desta entrega.
