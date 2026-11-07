# Entrega 0.2

## Funcionalidades

A versão substitui o arquivo monolítico por módulos de controles, física, câmera, personagem, mundo, progresso, áudio, qualidade, recursos, agrupamento estático e diagnóstico de leitura. O enredo e o objetivo do capítulo inicial são preservados.

O joystick reaproveita a captura de ponteiros da branch experimental. A zona morta agora é radial e os ponteiros de corrida/câmera são independentes. A câmera se limita ao lado direito no toque, tem dois eixos, distância adaptativa por colisão e sensibilidade configurável. O teclado segue disponível.

As portas abrem com interpolação, atualizam os volumes de colisão e não varrem o jogador. Os objetos só podem ser coletados durante a missão ativa; não duplicam após recarregar. A câmera evita atravessar paredes e cobre o plano próximo com margem conservadora. A colisão do jogador usa subpassos para impedir atravessamento em frames lentos.

LocalStorage salva capítulo, IDs de objetos, posição, órbita, portas e preferências. A carga filtra IDs inválidos, duplicatas, valores não finitos e etapas inconsistentes; posições dentro de obstáculos voltam ao ponto inicial. O armazenamento pode ser negado sem interromper o jogo. Não há sincronização entre aparelhos.

## Limitações conhecidas

- Os manequins articulados são provisórios e não equivalem a personagens humanos semirrealistas finais. Ainda faltam referências e GLBs licenciados do autor.
- GLBs externos precisam conter seus próprios clipes para animação esquelética; não há retargeting automático.
- A câmera usa volumes AABB conservadores para evitar paredes; perto de obstáculos pode se aproximar bastante do personagem. Não há câmera cinematográfica nem transparência dinâmica de paredes.
- As árvores usam grupos instanciados de folhas volumétricas, sem vento, texturas fotográficas ou LOD de longa distância.
- As sombras são PCF suaves, sem iluminação global. Não há pós-processamento.
- Portas usam AABB recalculada durante a rotação, com bloqueio conservador que pode exigir afastar-se da folha. Telhados são ocultados quando o jogador entra na área da sala.
- A escala automática de resolução depende do tempo dos frames e pode reagir a carga de CPU além da GPU.
- Não foi possível medir S24 Ultra/A35 físicos. As metas de 60/30 FPS ainda precisam de validação real.
- O mapa continua sendo o recorte do capítulo inicial. Não há multiplayer, salvamento em nuvem, inventário expandido ou novas missões longas.

## Prioridades 0.3

1. Receber referências e modelos GLB licenciados com rig/clipes, validar silhuetas, mãos e animação de conversa.
2. Medir FPS, tempo de CPU/GPU, memória e temperatura em S24 Ultra e A35 reais, por pelo menos dez minutos; ajustar orçamento por aparelho.
3. Refinar câmera em interiores, recorte de paredes e oclusão do personagem; melhorar LOD e batching conforme medições.
4. Expandir roteiro, escola e interações sem bloquear o capítulo inicial; adicionar áudio ambiente com recursos licenciados.
5. Adicionar remapeamento de controles, opções de tamanho/opacidade do joystick, legendas e testes em Safari/Firefox.

Os comandos e resultados finais de validação estão registrados na seção abaixo após execução da suíte.

## Validação executada

- `npm run build`: passou, 21 módulos transformados. Bundle principal de aproximadamente 603 kB (162 kB gzip) e carregador GLB separado sob demanda. Vite emite aviso de chunk acima de 500 kB; não há erro de build. A otimização adicional do download fica para uma próxima revisão.
- `npm run test:unit`: 11 testes aprovados. Inclui proporção e diagonais do joystick, movimento relativo à câmera, subpassos de colisão, limites, interseção da câmera, acompanhamento/recuperação de distância, estados do humanoide, fluxo integral do capítulo, dados inválidos, armazenamento negado e presets/escala adaptativa.
- `npm test`: 11 testes Chromium/Playwright aprovados em aproximadamente 1,3 minuto. Inclui exploração/corrida/conversa inicial, porta e colisão, foto e encerramento do capítulo, persistência/configurações, pausa/reinício, coleta real de caderno e cartão nas salas, mouse/sensibilidade, foco após botão de som, três toques simultâneos independentes, cancelamento/blur e retrato/paisagem.
- O teste de agrupamento verificou menos de 160 draw calls e menos de 110 geometrias GPU na cena observada em qualidade Baixa. Esses limites não são medições de FPS nem garantia para modelos externos.
- Capturas de desktop e Android emulado foram inspecionadas. Emulação usa Chromium com renderização de software; não substitui Galaxy S24 Ultra/A35 físicos.
- `git diff --check`: passou.

Falhas encontradas durante a validação foram corrigidas: canvas alterando o layout ao girar o celular; alvo de porta disputando prioridade com a lembrança; foco em botões bloqueando WASD. O diagnóstico de leitura foi separado do ponto de entrada para não iniciar uma segunda instância ao importar o módulo em testes com Vite.

## Arquivos alterados e adicionados

Alterados: `README.md`, `index.html`, `package.json`, `package-lock.json`, `playwright.config.js`, `src/main.js`, `src/style.css` e `tests/game.spec.js`.

Adicionados: `src/character-assets.js`; `src/systems/audio.js`, `batching.js`, `camera.js`, `character.js`, `controls.js`, `diagnostics.js`, `physics.js`, `progress.js`, `quality.js`, `resources.js`, `world.js`; `tests/helpers.js`, `tests/mobile.spec.js`, `tests/unit/character-camera.test.js`, `tests/unit/quality.test.js`, `tests/unit/systems.test.js`; `docs/ANALISE-02.md`, `docs/MODELOS-GLB.md` e `docs/ENTREGA-02.md`.
