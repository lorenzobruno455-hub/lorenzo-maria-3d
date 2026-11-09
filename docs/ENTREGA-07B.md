# Project Aurora 0.7B — aventuras e animações

Base: 0.7A validada. Branch `feat/aurora-07b`; entrega por Pull Request, sem alterar a main. A escola, materiais, colisores e os cenários da 0.7A foram preservados. A única peça de ambientação acrescentada é uma fotografia cenográfica apoiada na mesa existente.

## Como jogar

Conclua o prólogo das três lembranças e abra **Álbum e história → Aventuras 0.7B** (também disponível no menu inicial). Inicie Primeiro Encontro. Depois de concluí-lo, O Livro Perdido e Uma Música Conhecida são liberados. Os encontros rápidos e a campanha anteriores continuam disponíveis para compatibilidade. Bia e Davi também oferecem o acesso às aventuras em suas conversas.

O objetivo e o marcador acompanham o alvo real da missão, inclusive NPCs em movimento. Cenas podem ser pausadas, retomadas e puladas; pular a encenação conclui a etapa cinematográfica, sem pular a investigação ou a atividade jogável. A versão publicada anteriormente no Sites permanece na 0.7A; este PR não a substitui automaticamente.

## Implementação integrada

| Sistema | Arquivos | Comportamento |
|---|---|---|
| Animação | `animation-controller.js`, `character.js`, manifesto e GLBs | Mixer, máquina de estados, crossfade, transientes, velocidade de reprodução proporcional, orientação suave, ações limitadas no tempo e ajuste de contato sentado |
| Modelos reais | `scripts/blender/build_aurora.py`, `public/models/aurora/*.glb` | Dois GLBs regenerados no Blender, 16 clips compatíveis com o rig original. Nada depende de downloads futuros do Mixamo |
| Cutscenes | `cutscene-manager.js`, `adventure.js`, `adventure.css` | Câmera interpolada, enquadramentos internos autorais, poses/posições temporárias de atores, diálogo, luz, efeitos e restauração de controle/transformações em todos os encerramentos |
| Missões | `quest-director.js`, `data/adventures.js`, `adventure.js` | Nós ordenados, pré-requisitos, eventos, escolhas, atividades, recompensas idempotentes e retomada |
| Interações | `environment-actions.js` | Capa abre em 3D; objeto recolhido percorre o espaço até a mão; observar fotos, apontar para instrumento, porta articulada e gesto de levantar |
| Salvamento | `progress.js`, `adventure.js` | Campo `adventure` validado dentro do save v04; campanha, inventário, opções e histórico preservados |
| Entrada | `main.js`, diálogos e painel existente | Teclado, mouse e botões de toque; ritmo também jogável sem áudio; foco modal e recuperação após blur |

## As três aventuras

**Primeiro Encontro:** chegada encenada com os protagonistas → exploração da sala → abrir o caderno → observar a fotografia cenográfica → conversar com Maria → escolha de abordagem → exercício sobre a distinção entre fonte histórica e encenação → conclusão cinematográfica → desbloqueio da memória e vale existentes.

O único registro histórico usado é preservado: **19/08/2024 — “Aula de história. Eu estava extremamente envergonhado, mas pedi para ficar com você.”** Caderno, fotografia, exercício, falas e encenação são identificados como ficção. A fotografia não é apresentada como prova do encontro real.

**O Livro Perdido:** conversa com Bia → escolha da abordagem → pista na estante → ordenar três lombadas pela pista (com tentativa e erro recuperável) → recolher fisicamente o livro → entregar a Bia → reação/cena final → amizade e conclusão persistente. Funciona inclusive em saves cujo encontro rápido antigo já terminou.

**Uma Música Conhecida:** conversa com Davi → escolha de ensaio → recolher partitura → experimentar o teclado → acertar quatro notas em um minijogo de ritmo → voltar a Davi → reação/cena final → recompensa persistente. Usa o áudio procedural original já existente; o alvo visual permite jogar com som desligado.

## Verificação

- `npm run test:unit`: **70/70 aprovados**, incluindo animações reais, estados, velocidade, interrupção de ações, restauração de cutscenes, três missões, escolhas, recompensas e save/retomada.
- `PLAYWRIGHT_BROWSERS_PATH=/workspace/work/browsers npm test`: **49/49 aprovados** na regressão integrada (12,8 minutos). Percursos completos das três aventuras, pausas, cancelamento de escolhas, reload, recompensas, campanha anterior, diálogos, movimentação, colisões, câmera e qualidade gráfica.
- `npx playwright test tests/adventure-mobile07b.spec.js`: **2/2 cenários adicionais aprovados** (22,1 segundos). Quebra-cabeça e ritmo são concluídos por toque no Android emulado, sem teclado ou áudio obrigatório. Total: **51 cenários de navegador executados e aprovados**.
- `npm run build`: **aprovada**. Mantém aviso conhecido de bundle maior que 500 kB; nenhum erro de produção. Os dois GLBs regenerados integram a build.
- `node scripts/smoke-production.mjs` em Vite Preview: **aprovado**, com dois GLBs HTTP 200 e canvas renderizado sem erros.
- Revisão independente: recuperação de escolhas canceladas e foco/retomada após blur corrigidos e verificados em navegador. A fotografia foi otimizada para uma malha com geometria compartilhada e culling por distância, mantendo os limites anteriores **<160 draws / <110 geometrias** nos testes de Baixa; os limites não foram afrouxados.

Os fluxos ponta a ponta usam ações de UI reais e recarregamentos com posições iniciais de fixture; não há API de teletransporte ou alteração de missão em produção. Movimento e trajetos com colisões são verificados na regressão existente. Não houve medição em Android/Chromebook físico nem garantia de FPS nesses aparelhos.

## Limitações e decisões

- Animação autoral estilizada para o piso plano do jogo; não há IK de terreno, captura de movimentos ou retargeting Mixamo. Não foi usada animação de esqueleto incompatível nem API paga.
- Contato sentado usa a altura do assento e uma referência aproximada de quadril; mãos/objetos usam uma trajetória autoral aproximada, sem solver de contato dos dedos.
- A retomada preserva o nó, escolhas e recompensas. Tentativas incompletas dos minijogos recomeçam quando reabertas; fechar a atividade interrompe seu relógio e impede acertos invisíveis.
- As cutscenes são cenas curtas na escola existente, não vídeos pré-renderizados. Movimento reduzido troca movimentos de câmera por cortes.
- A 0.7A ainda tem PR próprio. Enquanto não for mesclada, este PR é apresentado sobre `feat/aurora-07a` para mostrar apenas a diferença 0.7B.
- Próximas prioridades: revisão narrativa do usuário, animação de contato/IK, testes em Android físico e revisão artística dos enquadramentos.

Detalhes em [ANIMATION-SYSTEM.md](ANIMATION-SYSTEM.md), [CUTSCENES-07B.md](CUTSCENES-07B.md) e [MISSIONS-07B.md](MISSIONS-07B.md).

## Capturas reais

- [Enquadramento da introdução, com os dois protagonistas](captures/07b/first-intro.png).
- [Caderno com a capa aberta no mundo 3D](captures/07b/notebook-action.png).
- [Quebra-cabeça das lombadas](captures/07b/shelf-puzzle.png).
- [Ensaio musical jogável](captures/07b/music-rhythm.png).

Para a introdução, inicie Vite e execute `node scripts/capture-07b.mjs`. As demais capturas também são produzidas nos testes de aventuras; aguarda-se a transição do painel antes de capturá-lo.
