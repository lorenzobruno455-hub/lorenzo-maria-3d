# Expansão narrativa Aurora — quatro missões

Branch: `feat/aurora-narrative-expansion`. [PR #19](https://github.com/lorenzobruno455-hub/lorenzo-maria-3d/pull/19), empilhado sobre `feat/radio-mini-player`. Sem merge, alteração da main ou deploy.

## Base e auditoria

A consulta ao GitHub confirmou `main` em `f05e1c0` e a arte mais recente em `50c39ef` (PR #18 aberto). A cópia de trabalho limpa acrescentava a rádio e os ajustes de posição/minimização, até `a178c45`. Essa árvore publicada foi preservada integralmente como base. O terminal tinha uma conta sem escrita; a conexão da conta proprietária enviou as mesmas árvores Git, verificadas por SHA, com commits separados. Os commits locais originais também foram preservados. A base remota da rádio é `5e7cd333`, com árvore idêntica à base local publicada `a178c45`.

O mundo contínuo, a transformação do São Jorge, os três pavimentos, os seis NPCs e Lorenzo permanecem nos sistemas anteriores. Não foram alterados mapa, paredes, colisores, controles, os três minijogos, nomes/playlists das rádios ou textos históricos. A expansão acrescenta objetos pequenos sobre pontos de interação conhecidos; eles não criam colisores novos.

## Conteúdo jogável

| Missão | Exploração e interações | Puzzle e conclusão | Recompensa |
| --- | --- | --- | --- |
| O Plano de 14 Etapas | Caderno na sala de história, Bia, três conjuntos de páginas na sala/biblioteca/corredor, escolha com Maria | 14 cartões em quatro blocos; seleção e troca por toque; epílogo pulável | O Estrategista; Caderno dos Planos; diário; conversa adicional com Maria |
| Uma Carta Nunca Entregue | Envelope, livro, marcador do corredor, Bia, pasta na sala e caixa no jardim do campus | Ordem dos desenhos; crescimento de planta; cinco trechos da carta; epílogo | Palavras Guardadas; Envelope Restaurado; carta fictícia acessível no álbum/diário |
| A Frequência Perdida | Rádio no salão, Davi, bobina de papel na ciência, cristal cenográfico na biblioteca e antena de cartão no salão | Três canais simbólicos: ★ LorenzoFM → ◆ MariaFM → ♥ LorenzoeMariaFM; mensagem e epílogo | Na Mesma Frequência; Rádio Restaurado; transmissão no diário |
| O Arquivo Aurora | Requer seis memórias; diário na biblioteca; seis símbolos nos pontos das memórias já existentes | Linha do tempo com datas/títulos originais; associação de símbolo/lugar; páginas animadas e cena revisível | Guardião das Memórias; Arquivo Aurora Restaurado; álbum e diário |

Todo conteúdo adicional é apresentado como ficção narrativa inspirada no casal. Os símbolos são metáforas de gameplay. A nova carta e o arquivo não substituem a carta final nem os registros históricos. As outras três missões são opcionais para o Arquivo: basta ter as seis memórias.

O diário registra as etapas, coletas, escolhas e conclusões. As etapas devem ser cumpridas no cenário; o menu apenas inicia/retoma e acompanha objetivos, sem concluir puzzles ou transportar o jogador. Entre campus/jardim e São Jorge, o HUD aponta o portão físico; em outro andar, aponta primeiro as escadas. Cenas podem ser puladas; sair de uma conversa sem completá-la mantém a etapa disponível.

## Sistemas reaproveitados

- `Story`: painel, álbum, inventário, menu e ciclo de abertura/fechamento que restringe controles/câmera.
- `Dialogue`: texto, escolhas e identificação de ficção.
- `Adventure` / `EnvironmentActions` / `CutsceneManager`: gestos, confirmação de exploração, câmera, pausa, pular e restauração de atores/controles.
- `SchoolNarrative` e seus pontos: localização dos atores, biblioteca, ciência, salão e pontos históricos; `narrativeWaypoint` guia entre pavimentos.
- `InteractionRegistry`: distância, prioridade e verificação de oclusão continuam obrigatórias.
- `Audio.play`: confirmação sintetizada original. Não há novo player, streams ou dependência dos MP3s para concluir a missão musical.
- `Resources` / Colorbeat: materiais, geometrias, toon shading e fontes existentes. Puzzles usam DOM/CSS e o loop já existente.
- `saveProgress` / `validateProgress`: mesma chave, backups e domínio adicional opcional `progress.expansion`.

O pequeno controlador compartilhado da expansão acrescenta coletas em qualquer ordem e permutações persistentes, sem reescrever o QuestDirector antigo. Não há quatro motores de minijogos. Cartões usam seleção de origem/destino, dicas, conferência com erro e nova tentativa; sair salva a disposição. Recompensas derivam da conclusão e usam um recibo `rewarded` e o registro existente de conquistas. Inventário e álbum apresentam os itens conquistados sem duplicar seu armazenamento.

## Saves

Saves anteriores recebem um estado vazio da expansão, preservando campanha, itens, interações e visitas. Dados incompletos são normalizados: missões/fragmentos/cartões desconhecidos e permutações inválidas não são aceitos. Etapa, coletas, escolhas e disposição dos puzzles são salvas após interações/trocas. Puzzles concluídos são reconhecidos pela etapa avançada. O Arquivo reconhece as seis memórias legadas validadas pelo sistema original.

O botão antigo de reiniciar o prólogo mantém também a expansão. Cenas interrompidas sem conclusão não entregam recompensa; conclusão e pular entregam uma vez. Rever uma cena conserva o progresso. Os arquivos de memórias, capítulos, carta original, controles, mundo contínuo e rádio não têm alterações em relação à base.

## Arquivos

Adicionados:

- `src/data/expansion.js`: definições das quatro missões, cartões, pistas e carta fictícia.
- `src/systems/expansion-progress.js`: domínio validado, transições, coletas, permutações e recibos.
- `src/systems/narrative-expansion.js`: adaptação aos sistemas, objetos compartilhados, diário, puzzles, cenas e vistas de recompensa.
- `src/expansion.css`: aparência Colorbeat e alvos de toque.
- `tests/unit/expansion.test.js` e `tests/narrative-expansion.spec.js`: persistência, fluxos, puzzles, pré-requisitos e interface.
- `docs/superpowers/plans/2026-11-13-narrative-expansion.md`, este relatório e `docs/captures/narrative-expansion/`.

Alterados:

- `src/main.js`: montagem, interações/objetivos, atualização pelo loop existente, limpeza e diagnóstico somente leitura.
- `src/systems/progress.js`: inicialização/validação do novo domínio opcional.
- `src/systems/story.js`: integração nas vistas e conversa adicional com Maria.
- `src/systems/adventure.js`: evita iniciar uma aventura antiga durante uma missão nova ativa.
- `src/data/achievements.json`: quatro conquistas.

Sem alterações em dependências, build/Vite, rádio, mapas, materiais globais ou recursos históricos.

## Verificação

- 186 testes unitários passaram, incluindo sete testes novos de expansão.
- Fluxos focados da carta, frequência e arquivo passaram do início ao fim; a frequência com requisições MP3 bloqueadas.
- Os quatro fluxos completos passaram na regressão, incluindo o Plano do início ao fim. Os sete cenários novos de navegador passaram; a retomada da cena final, recompensa e liberação de movimento também passaram.
- Pré-requisito, álbum/inventário, carta acessível, replay sem duplicar recompensa e pausa da animação passaram.
- Toque em 915×412, 390×844 e 640×360: 14 cartões, alvos ≥44×44 CSS px, ausência de overflow horizontal, troca por toque, isolamento de teclado/multitoque e movimento restaurado ao fechar.
- Seis reaberturas do painel sem aumento de geometrias, texturas ou props; páginas temporárias removidas após a cena. Isso não equivale a um perfil completo de heap JavaScript.
- Build de produção aprovado; permanece o aviso anterior do chunk Three.js acima de 500 kB.
- Regressão geral parcial, encerrada a pedido do proprietário para economizar créditos: **74 passaram, 1 timeout, 1 interrompido e 36 não executados**, de 112 cenários distintos. A reconexão do ambiente separou a execução em duas partes, sem repetir os 59 cenários anteriores. Os sete cenários da expansão e os quatro da rádio passaram.
- Timeout: `colorbeat081.spec.js`, roteiro antigo de ida/volta campus–escola, atingiu 240s ao retornar ao campus, com expansão inativa. Não foi classificado como sucesso nem confirmado como falha preexistente.
- Interrompido por orientação de economia: `sao-jorge-m2.spec.js`, cenário antigo de carregamento/presets/retorno. Os 36 restantes não foram executados. Portanto, a regressão geral **não está integralmente verde**; os logs e a lista de pendências estão resumidos em `validation-summary.json`.

As viagens entre etapas dos testes novos usam recarga de posições legítimas no save para economizar tempo; os objetivos são cumpridos por interações reais e cliques/toques, sem API de conclusão ou teletransporte no produto. A caminhada contínua e as escadas também pertencem à regressão existente.

### Renderização

[Contadores reproduzidos](captures/narrative-expansion/render-metrics.json), mesma câmera pausada da biblioteca, 915×412, preset Baixo, sombras desligadas, Chromium/SwiftShader:

| Contador | Base anterior | Expansão |
| --- | ---: | ---: |
| Draw calls | 101 | 107 |
| Triângulos | 152.692 | 152.764 |
| Geometrias | 132 | 132 |
| Texturas | 19 | 19 |
| Programas | 27 | 27 |
| Materiais compartilhados no registro | 178 | 181 |

Os props são criados conforme etapa/pavimento e ficam ocultos quando não são relevantes. Não usam texturas novas, sombras dinâmicas próprias ou colisores. O final do arquivo cria 12 meshes temporários com geometria/material compartilhados e os remove ao terminar. Não foram medidos FPS em aparelho físico.

## Android: como testar

1. Atualize uma cópia do repositório para `feat/aurora-narrative-expansion` e execute `npm ci` e `npm run dev -- --host 0.0.0.0 --port 5173` na raiz que contém `package.json`.
2. No computador e no celular conectados à mesma rede Wi-Fi, abra no Chrome Android o endereço **Network** mostrado pelo Vite, por exemplo `http://IP-DO-COMPUTADOR:5173`. `localhost` no celular não aponta para o computador. Esse teste LAN por HTTP não instala uma PWA; instalação exige a publicação HTTPS posterior, que não foi realizada nesta entrega.
3. Abra **Álbum e história → Expansão narrativa · quatro missões**. Inicie uma missão e acompanhe o objetivo. Entre/saia da escola a pé pelos portões; use as escadas existentes.
4. Feche o painel no meio de um puzzle, reabra e confira a disposição; feche/reabra o jogo no meio de uma coleta. Termine e confirme uma única recompensa no inventário/álbum/conquistas.
5. Teste os três presets no Galaxy S24 Ultra, toque e joystick em paisagem, rádio tocando, pausa/pular e o retorno ao campus. Para o Arquivo, use o save com os seis capítulos completos.

Pendente: confirmação em Android físico, tempos reais das quatro missões e desempenho/FPS no Galaxy S24 Ultra. Não se afirmam resultados físicos sem esse teste. O site público segue na versão anterior, conforme a proibição de deploy automático.

Capturas essenciais anexadas: puzzle do plano, carta, sintonia, linha do tempo, associação e Android em paisagem. Outras capturas de desenvolvimento ficaram em `work/narrative-expansion/extra-captures` local para evitar ampliar o PR.
