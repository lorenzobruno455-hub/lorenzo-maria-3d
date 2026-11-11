# Referências visuais — Hi-Fi RUSH → Lorenzo & Maria 3D

## Complemento do proprietário — Comic Overdrive 2.0, 11/11/2026

Referências adicionais solicitadas durante D0–D1:

- [Hi-Fi RUSH 2D Cinematics — Bruno Luna / Behance](https://www.behance.net/gallery/163115085/Hi-Fi-RUSH-2D-Cinematics): a indexação pública identifica supervisão de backgrounds na Titmouse, estudos de cor e feedbacks de layout. A página e suas imagens completas retornaram HTTP 403 nesta sessão; **inspeção visual integral pendente**, sem atribuir detalhes não vistos ao trabalho.
- [Hi-Fi RUSH — Interface In Game](https://interfaceingame.com/games/hi-fi-rush/): página consultada e imagens de menu principal, pausa e opções inspecionadas. Observados painéis angulares, áreas vermelhas/pretas, seleção amarela, cabeçalhos expressivos, hierarquia compacta e abas com estado destacado. Os rótulos funcionais mantêm leitura simples.

Aplicação proposta na revisão de UI/cutscenes da **Fase 5**: painéis e enquadramentos originais; contraste claro entre estado selecionado e fundo; hierarquia visual entre título/ação/explicação; preservar área útil do jogo, alvos de toque, navegação, reduced motion e alto contraste. Para cinematics, estudar chaves de cor e organização de planos após acesso visual à referência. Nenhum asset, fonte, logotipo ou interface será extraído ou copiado. A foto do São Jorge prevalece na arquitetura. O bloco 0–1 não amplia o escopo para reconstruir a interface.

Pesquisa: **7 de novembro de 2026**. Base do projeto: versão 0.5, Three.js r181, JavaScript e Vite.

**Estado:** pesquisa feita antes da implementação e aprovada pelo usuário. A direção integrada foi aplicada na edição **Aurora Comic**; veja [entrega e limites efetivos](ENTREGA-VISUAL-COMIC.md). As seções de proposta registram as decisões que orientaram o trabalho. Os números de cores, tamanhos e durações são escolhas propostas para Lorenzo & Maria, não especificações oficiais de Hi-Fi RUSH.

## Objetivo e identidade

Adotar Hi-Fi RUSH como referência principal de linguagem gráfica: cor, desenho angular, luz em blocos, contorno, composição e movimento expressivo. A escola brasileira, os personagens, as seis memórias, os textos originais, as missões e a exploração continuam sendo Lorenzo & Maria.

A referência atualiza a direção anterior semirrealista para **proporções humanas e escolares plausíveis com acabamento de quadrinhos**. Não implica inventar características físicas dos protagonistas. O estilo deve aparecer conjuntamente na interface, nos personagens, nos objetos e nos ambientes.

## Método e grau de evidência

- **Observado:** inspeção das capturas públicas abaixo e de quadros do vídeo de diálogo em 0,2 s, 2 s, 5,5 s e 6,8 s. As capturas de menus/HUD são de um arquivo de interfaces, não de um manual oficial.
- **Confirmado pela equipe:** entrevistas publicadas por Unreal Engine e Xbox Wire; resumo da apresentação técnica na GDC.
- **Proposto:** adaptações, paleta hexadecimal, fontes alternativas, componentes e parâmetros para este projeto.
- **Não verificado:** família tipográfica oficial, valores oficiais de cor, espessuras exatas dos contornos e durações exatas das transições do original. Não se atribuem esses dados ao jogo.

As imagens de terceiros ficam referenciadas nos seus sites; não integram o pacote de recursos do jogo. Os links abriam durante a pesquisa, sujeitos a mudanças futuras.

## Referências públicas verificáveis

| ID | Referência | Evidência e uso |
| --- | --- | --- |
| R1 | [Main Menu — Interface In Game](https://interfaceingame.com/screenshots/hi-fi-rush-main-menu/) · [imagem](https://interfaceingame.com/wp-content/uploads/hi-fi-rush/hi-fi-rush-main-menu.png) | Captura inspecionada: menu, seleção, composição e tratamento de texto. |
| R2 | [Options — Interface In Game](https://interfaceingame.com/screenshots/hi-fi-rush-options/) · [imagem](https://interfaceingame.com/wp-content/uploads/hi-fi-rush/hi-fi-rush-options.png) | Captura inspecionada: menu secundário, abas, configurações e hierarquia. |
| R3 | [In Game — Interface In Game](https://interfaceingame.com/screenshots/hi-fi-rush-in-game-4/) · [imagem](https://interfaceingame.com/wp-content/uploads/hi-fi-rush/hi-fi-rush-in-game-4.png) | Captura inspecionada: HUD, contornos, retículas e efeito gráfico de impacto. |
| R4 | [Home Base — Interface In Game](https://interfaceingame.com/screenshots/hi-fi-rush-home-base/) · [imagem](https://interfaceingame.com/wp-content/uploads/hi-fi-rush/hi-fi-rush-home-base.png) | Captura inspecionada: escolhas de conversa associadas ao cenário e retrato. |
| R5 | [Dialogue — Interface In Game](https://interfaceingame.com/screenshots/hi-fi-rush-dialogue/) · [vídeo MKV, cerca de 7 s](https://interfaceingame.com/wp-content/uploads/hi-fi-rush/hi-fi-rush-dialogue.mkv) | Quadros inspecionados: indicador de conversa, mudança de câmera e caixa de fala. A marcação 5,5 s identifica o quadro analisado, não um tempo oficial de animação. |
| R6 | [Entrevista com John Johanas, Kosuke Tanaka e Yuji Nakamura — Unreal Engine, 16/03/2023](https://www.unrealengine.com/developer-interviews/hi-fi-rush-was-inspired-by-shaun-of-the-dead-and-futurama?lang=en-US) | Fonte primária sobre direção, iluminação estilizada, desempenho e sincronização das cenas. |
| R7 | [3D Toon Rendering in Hi-Fi RUSH — GDC 2024](https://www.gdcvault.com/play/1034251/3D-Toon-Rendering-in-Hi) | Resumo público da palestra de Kosuke Tanaka e Takashi Komada: renderer deferred customizado e toon shading de personagens e ambientes. |
| R8 | [Apresentação do jogo — Xbox Wire, 25/01/2023](https://news.xbox.com/en-us/2023/01/25/hi-fi-rush-preview-out-now-hands-on/) | Descreve linhas fortes, animação exagerada, onomatopeias, quadros de impacto e pontos Ben-Day. |
| R9 | [História oral com a equipe — Xbox Wire, 04/10/2023](https://news.xbox.com/en-us/2023/10/04/hi-fi-rush-exclusive-oral-history/) | Fonte primária sobre direção artística e continuidade entre música, animação e narrativa. Ver seções Art Direction e The Director’s Chair. |
| R10 | [Hi-Fi RUSH — Hammer Creative](https://hammercreative.com/work/hi-fi-rush) | Estudo de caso do fornecedor da identidade de campanha: grafismos, tipografia e motion graphics. **É material promocional; não comprova a implementação do HUD.** |

O PDF de slides hospedado em media.gdcvault.com retornou HTTP 403 nesta sessão. O conteúdo técnico atribuído a R7 limita-se ao resumo acessível, sem alegar leitura do PDF ou análise de passes que não foram vistos. O trailer incorporado em R8 teve acesso automatizado limitado; as observações temporais específicas usam R5, que foi efetivamente inspecionado.

## 1. Menus principais e secundários

**Observado — R1/R2:** painel vermelho irregular, seleção amarela com seta, base preta; opções com abas superiores, linhas e explicação lateral.

**Adaptação proposta:** menu principal sobre uma vista do Colégio Aurora. Painel próprio em forma de folha recortada, com Continuar, Exploração livre, Capítulos, Álbum e Configurações. Seleção com faixa amarela e marcador de página. Textos, ordem de progressão e ações existentes permanecem funcionais.

Pausa e configurações ganham abas de controles, som e gráficos, com explicação curta da opção selecionada. No Android, colunas viram uma lista vertical rolável; alvos de toque continuam retangulares e têm pelo menos 48×48 CSS px. O recorte visual não reduz a área clicável.

## 2. HUD durante a jogabilidade

**Observado — R3:** informações nas bordas, barras angulares e indicadores com forte contraste; o centro serve à ação.

**Adaptação proposta:** faixa compacta de capítulo e objetivo, contador real de memórias e progresso existentes. A prioridade visual é o próximo objetivo. Área central livre para ler o caminho e os personagens. O prompt de proximidade vira etiqueta curta de papel, com E no desktop ou Interagir no celular.

As cores de estado também usam texto e símbolo. A posição dos controles de joystick/câmera/corrida é preservada. A escola mantém objetivos de exploração; pontuação de combate e barras de vida não são introduzidas.

## 3. Caixas de diálogo

**Observado — R4/R5:** retrato destacado, nome em etiqueta escura, caixa clara recortada, escolhas angulares sobre o mundo.

**Adaptação proposta:** `DialoguePanel`, `SpeakerTag` e `ChoiceList` próprios. Corpo claro com borda de tinta; nomes destacados e texto sem inclinação. Retratos futuros precisam de referências autorizadas; por enquanto, emblemas com iniciais evitam inventar rostos.

Preservar aceleração, saída, escolhas, ordem das falas e os rótulos que distinguem ficção de memórias relatadas. Para leitura de livros, painel lateral no modo horizontal; a câmera e o livro ocupam a área livre. No retrato, painel inferior com rolagem, sem encobrir todos os controles de fechar.

## 4. Tipografia e hierarquia

**Observado — R1/R2/R5:** títulos expressivos e inclinados, opções fortes e texto de leitura mais sóbrio. A identificação da família oficial não foi verificada.

**Escolhas próprias verificadas:**

| Função | Família proposta | Pesos de partida | Licença e origem |
| --- | --- | --- | --- |
| Títulos, botões, capítulos | Barlow Condensed | 700/800; itálico apenas em títulos curtos | [Google Fonts / Barlow Condensed](https://github.com/google/fonts/tree/main/ofl/barlowcondensed) · [OFL original](https://raw.githubusercontent.com/google/fonts/main/ofl/barlowcondensed/OFL.txt) |
| Falas, datas, ajuda, configurações | Atkinson Hyperlegible | 400/700 | [Google Fonts / Atkinson Hyperlegible](https://github.com/google/fonts/tree/main/ofl/atkinsonhyperlegible) · [OFL original](https://raw.githubusercontent.com/google/fonts/main/ofl/atkinsonhyperlegible/OFL.txt) |

As duas fontes têm SIL Open Font License 1.1 nas fontes consultadas. Ao integrar, hospedar arquivos localmente, incluir cada licença e atribuição correspondente, manter fallbacks e `font-display: swap`. Não são apresentadas como as fontes de Hi-Fi RUSH.

Escala proposta: títulos de tela 36–64 px adaptáveis; seção 24–32 px; leitura 16–18 px; metadados 14 px. Entrelinha de leitura entre 1,4 e 1,6. Testar acentos portugueses e títulos longos das memórias. Contorno tipográfico fica restrito aos títulos maiores; texto longo usa contraste direto.

## 5. Paleta de cores

**Observado — R1/R3:** amarelo, vermelho e preto dão destaque; cenários combinam tons quentes com verdes e azuis. Não foi encontrada uma tabela oficial de valores.

**Paleta original proposta para Lorenzo & Maria:**

| Token proposto | Valor | Papel |
| --- | --- | --- |
| Tinta | `#141824` | Contornos, texto e áreas de apoio |
| Papel | `#FFF5DC` | Leitura e páginas das memórias |
| Sol | `#FFD43B` | Seleção, foco e recompensa |
| Coral | `#EA5A49` | Capítulos e detalhes expressivos |
| Aurora | `#138A91` | Identidade do colégio e navegação |
| Caderno | `#4D63B8` | Biblioteca, estudo e sombra colorida |

Os valores são propostos, sem extração colorimétrica ou alegação de equivalência oficial. Seleção amarela recebe texto Tinta; Coral e Aurora precisam de pares de texto medidos antes do uso em leitura pequena. A meta é contraste mínimo de 4,5:1 para texto comum e 3:1 para texto grande, conforme [WCAG 2.2 — contraste](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

Paredes claras, madeira ocre e vegetação verde continuam identificando a escola. A saturação deve favorecer pontos importantes, sem transformar cada superfície em uma cor de alerta.

## 6. Materiais e técnicas de cel shading

**Confirmado — R6/R7:** a equipe buscou um aspecto 2D limpo, nítido e colorido; o jogo usa UE4 modificado, toon shading no mundo inteiro e técnicas de iluminação estilizadas. Isso não equivale a um filtro aplicado à imagem final.

**Adaptação técnica proposta, própria:** usar `MeshToonMaterial` com uma rampa compartilhada de três faixas como ponto inicial em personagens, mobiliário e arquitetura. Redesenhar albedos procedurais com variação controlada; sombras coloridas e detalhes selecionados substituem ruído fino generalizado. Manter tratamento específico de água, vidro, páginas emissivas ou placas conforme necessário.

A API e `gradientMap` existem em [Three.js r181, código do material](https://raw.githubusercontent.com/mrdoob/three.js/r181/src/materials/MeshToonMaterial.js); [documentação](https://threejs.org/docs/pages/MeshToonMaterial.html) pede filtragem Nearest para a rampa. O número de faixas é decisão nossa, a validar com os níveis atuais de luz e exposição.

A sala, biblioteca e jardim recebem o mesmo tratamento de luz e acabamento. Cel shading não corrige por si só silhuetas pobres, móveis desalinhados ou modelos provisórios; as correções geométricas da 0.5 devem permanecer.

## 7. Contornos dos personagens e cenários

**Observado — R3/R4/R5:** silhuetas escuras e traços internos selecionados separam personagens, estruturas e materiais.

**Adaptação proposta:** contorno de silhueta nos personagens próximos; linhas estruturais agrupadas em portas, janelas, estantes e bancos. Avaliar casca invertida com extrusão pelas normais para atores e arestas selecionadas para arquitetura. Esses métodos são nossas alternativas, **não uma afirmação sobre o algoritmo exato do original**.

[EdgesGeometry](https://threejs.org/docs/pages/EdgesGeometry.html) pode selecionar arestas por ângulo; usar seletivamente para evitar mostrar toda a triangulação. Controlar densidade por distância e qualidade. Os contornos precisam seguir os pivôs das animações e não introduzir colisões. Pés, mãos e rosto não devem virar blocos de tinta quando vistos de longe.

## 8. Efeitos visuais de quadrinhos

**Observado — R3, descrito em R8:** palavras de impacto, retículas e formas de explosão compõem o efeito.

**Adaptação proposta:** criar grafismos próprios de papel, sublinhado, estrelas e traços de movimento. Uma memória encontrada pode disparar um pequeno quadro com o título original; a raridade aparece em faixa e símbolo. A atividade musical pode usar acentos gráficos sincronizados quando houver informação real do áudio.

Retículas ficam em bordas decorativas, sombras ou transições curtas; não atrás de todo texto nem sobre a cena inteira continuamente. Efeitos usam reutilização de recursos e deixam de atualizar quando terminam. A descoberta física continua mais importante que um marcador luminoso permanente.

## 9. Animações de transição

**Verificado — R5:** a sequência passa do indicador de conversa à apresentação da fala; os quadros mostram mudança de enquadramento. **Confirmado — R6/R9:** música e transições de cenas foram planejadas em conjunto. Não foram medidos timings oficiais de menus.

**Adaptação proposta:** entrada de painel com deslocamento curto e recorte; seleção com pequeno avanço de faixa; abertura de capítulo como virada gráfica. Valores iniciais nossos: foco em 100–140 ms, painel em 180–240 ms e destaque de descoberta em até 450 ms. São parâmetros de teste, não promessas de fidelidade temporal.

Entrada, interação e pausa respondem imediatamente; animação decorativa não bloqueia comandos. Preservar `prefers-reduced-motion`, com estado final direto e sem tremor ou zoom não essencial, seguindo a orientação de [WCAG — animação por interação](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html). Não reduzir a taxa dos controles ou da câmera para imitar animação desenhada.

## 10. Enquadramentos cinematográficos

**Observado — R1/R4/R5:** interface e enquadramento dividem o espaço; conversa e retrato coexistem com o cenário. R6 confirma planejamento conjunto das passagens entre cena e jogo.

**Adaptação proposta:** `NarrativeFraming` seleciona composição por ação: plano médio dos interlocutores, detalhe de livro ou plano de descoberta. Reservar área para o painel de fala e preservar a linha de visão do objeto. Retorno suave à câmera livre anterior; colisão e ajuste de distância continuam ativos durante o movimento.

Na escola, a fonte, o corredor e a estante de memórias são referências de composição. Cortes, diagonais e poses são usados em momentos narrativos; a exploração livre mantém horizonte estável. Não acrescentar balanço permanente nem sacrificar a câmera Android para reproduzir planos de ação de outro gênero.

## Galeria para consulta

Imagens externas apenas como referência, com autoria pertencente aos respectivos titulares. Os links R1–R5 permanecem disponíveis acima caso o host não permita incorporação.

### Menu principal — R1

![Hi-Fi RUSH: captura de menu principal, painel recortado e seleção amarela; referência externa](https://interfaceingame.com/wp-content/uploads/hi-fi-rush/hi-fi-rush-main-menu.png)

### Configurações — R2

![Hi-Fi RUSH: captura de opções com abas e descrição lateral; referência externa](https://interfaceingame.com/wp-content/uploads/hi-fi-rush/hi-fi-rush-options.png)

### HUD, contornos e efeito gráfico — R3

![Hi-Fi RUSH: captura de jogabilidade com HUD e efeito de quadrinhos; referência externa](https://interfaceingame.com/wp-content/uploads/hi-fi-rush/hi-fi-rush-in-game-4.png)

### Escolhas associadas ao cenário — R4

![Hi-Fi RUSH: captura de escolhas no cenário; referência externa](https://interfaceingame.com/wp-content/uploads/hi-fi-rush/hi-fi-rush-home-base.png)

A caixa de fala foi conferida no [vídeo de diálogo R5](https://interfaceingame.com/screenshots/hi-fi-rush-dialogue/), em particular no quadro de 5,5 s. A imagem de R4 mostra escolhas; não é usada como substituta de evidência da caixa de fala.

## Proposta de componentes próprios e integração

Nomes abaixo são propostos para este projeto, não nomes de componentes do original.

| Componente proposto | Responsabilidade | Integração existente |
| --- | --- | --- |
| `ComicPanel` / `ActionRibbon` | Recorte, borda de tinta, foco e estado desabilitado | `index.html`, `style.css`, botões criados em `story.js` |
| `ChapterHUD` / `InteractionPrompt` | Objetivo, contagem, proximidade e indicação de tecla/toque | `main.js`, `interaction-registry.js` |
| `DialoguePanel` / `SpeakerTag` / `ChoiceList` | Falas, nomes e escolhas acessíveis | `dialogue.js`; preservar IDs e callbacks |
| `MemoryCard` / `MemoryBookLabel` | Título, data, raridade e bloqueio | Álbum e livros físicos de `story-world.js` |
| `ToonPalette` / `ToonMaterials` | Tokens compartilhados, rampas e exceções por material | `resources.js`, adaptador GLB, placas e props |
| `OutlineLayer` | Silhuetas e linhas arquitetônicas com orçamento | `character.js`, `batching.js`, `quality.js` |
| `ComicFeedback` | Efeitos temporários de descoberta e interação | Eventos reais de coleta, memória e minijogo |
| `NarrativeFraming` | Composição e retorno à exploração | `camera.js`, `story.focus`, interlocutor de `living.js` |

A leitura do projeto confirmou que os materiais principais passam por `Resources`, mas existem materiais próprios em placas, capas e GLBs que também precisam de revisão. Alterar apenas `Resources.material()` deixaria partes do mundo com aparência incompatível. Os humanoides são articulados e agrupados por junta; contornos precisam respeitar esse funcionamento e o descarte dos recursos.

## Caminhos técnicos considerados

1. **Recomendado: estilo integrado com toon shading direto, contornos seletivos e UI gráfica.** Aproveita Three.js e os recursos atuais, preserva controles e permite reduzir detalhes por qualidade. Exige revisão artística de cada ambiente e testes de legibilidade; não garante resultado equivalente ao renderer do original.
2. **Alternativa: shader de iluminação próprio e contornos em pós-processamento.** Permite maior controle das bandas e do desenho em tela, com custo e complexidade maiores, especialmente em resolução móvel e transparências. Requer medir GPU antes de adotá-lo amplamente.

O usuário aprovou a direção integrada e a execução do caminho recomendado nesta conversa. A fidelidade deve ser avaliada pelo conjunto visual; reconstruir o renderer UE4 do original não é necessário para obter influência reconhecível neste jogo.

## Ordem e critérios de aceitação propostos

1. Fixar tokens, tipografia licenciada e componentes de painel/seleção. Conferir menu, pausa, álbum e diálogo, inclusive estados de foco e desabilitado.
2. Aplicar luz em blocos e paleta às três áreas principais e aos personagens. Reavaliar água, vidro, placas e capas. Não mudar a aparência biográfica nem os conteúdos das memórias.
3. Adicionar contornos seletivos e grafismos temporários, medindo draw calls, geometria e tempo de quadro. Preservar batching, instancing e descarte.
4. Integrar enquadramentos e transições narrativas ao estado real do jogo e às preferências de movimento.
5. Capturar sala, biblioteca, jardim, menu, HUD, conversa, álbum, livro aberto e atividade musical. Comparar com a 0.5 em posição e qualidade equivalentes.
6. Reexecutar regressão de prólogo, seis capítulos, diálogos, minijogos, recompensas, LocalStorage e multitouch; gerar a build e inspecionar as imagens.

A qualidade Baixa mantém a direção de cor e sombreamento; reduz contornos distantes, sombras e grafismos adicionais. Média e Alta podem aumentar detalhes com o mesmo desenho. Não prometer FPS para S24 Ultra/A35 sem medição real. O teste existente de menos de 160 draw calls na vista de qualidade baixa deve continuar como limite de regressão; medir também interiores, que essa vista sozinha não representa.

**Condição de aceite visual:** a influência deve ser perceptível no menu e durante a exploração, através do mesmo vocabulário de cor, sombra, contorno e grafismos. Legibilidade dos textos, espaço de jogo, funcionamento das missões e identidade escolar têm de permanecer reconhecíveis.

## Limites e pendências

Este documento registra a pesquisa e a adaptação aprovadas; a entrega vinculada distingue o que foi implementado dos limites remanescentes. Não há nova geração de mídia, cópia de assets de Hi-Fi RUSH, fonte oficial identificada ou benchmark de celular neste trabalho de pesquisa. Um material toon aplicado aos modelos provisórios não substitui a futura revisão de silhuetas, rostos autorizados e animação.
