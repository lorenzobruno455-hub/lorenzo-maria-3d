# Análise antes das alterações — versão 0.2

## Base examinada

- `main`: `4c46a5b08c57a4f14e959cdc7b39be2352eb3384`.
- `feat/mobile-controls-v02`: `bfeba38f2b2f34f7045f42248054a6096259fdfe`, três commits à frente de main; mudanças apenas em index.html, src/main.js e src/style.css.
- Todos os arquivos do projeto foram examinados, incluindo package-lock, configurações, README, teste e .gitignore. Não havia AGENTS.md no workspace nem no inventário remoto examinado.

## Estrutura original e limitações

O HTML monta HUD, diálogos, boas-vindas e controles. Um único main.js contém mundo, câmera, colisões, personagens, capítulo, entrada e áudio. O CSS controla todo o layout; Vite gera a aplicação e Playwright cobre exploração e conversa inicial.

As colisões eram retângulos 2D expandidos; o jogador poderia atravessar objetos finos com deslocamentos grandes. A câmera só acompanhava o jogador e atravessava paredes. Personagens eram cápsulas sem articulação nos joelhos, cotovelos ou mãos. As geometrias eram recriadas para cada objeto e as sombras usavam 2048 em qualquer dispositivo. Não havia salvamento, portas funcionais, pausa nem opções gráficas. A interface ocupava parte importante da tela em paisagem.

## Avaliação da branch experimental

Aproveitados: entrada proporcional do joystick, movimento relativo à câmera, captura independente do ponteiro do joystick, reset em pointercancel/lostpointercapture, corrida por pressão, arrasto e clamp de inclinação. IDs joystick/stick/run/interact foram preservados.

Corrigidos e expandidos: a zona morta por eixo distorcia diagonais rasas; agora é radial. O canvas iniciava câmera em toda a tela; toque agora começa na metade direita e não captura gestos dos botões. Run usava a mesma tecla Shift do teclado e podia ser limpo por outro ponteiro; agora mantém um conjunto independente de ponteiros. Blur, resize, pausa e ocultação limpam todas as entradas. A câmera ganhou colisão volumétrica conservadora e distância variável.

## Organização 0.2

- main.js: integração e ciclo de vida, apresentação de diálogos, alvo contextual, HUD, marcador e efeitos.
- systems/physics.js: vetores analógicos, movimento, limites, colisões e segmento/AABB.
- systems/controls.js: teclado, mouse e múltiplos toques independentes.
- systems/camera.js: órbita, acompanhamento e prevenção de atravessamento.
- systems/progress.js: capítulo, textos originais, validação e LocalStorage versionado.
- systems/world.js: escola, portas, pontos de interesse, colecionáveis e visibilidade.
- systems/character.js: humanoide articulado provisório, animação e adaptador GLB.
- systems/resources.js e batching.js: cache de recursos e agrupamento estático.
- systems/quality.js: presets e escala adaptativa por duração real dos frames.
- systems/audio.js: efeitos sintetizados e controle de volume.

O esquema e o diálogo inicial, os três objetos e o encerramento do capítulo foram preservados. A branch experimental original será mantida como referência, sem reescrever seu histórico.
