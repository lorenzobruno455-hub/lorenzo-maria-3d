# Auditoria 0.8 · M1

Base escolhida: `feat/aurora-07c`, commit remoto `ef5a7414c6223e66679edf1f35f934c809740f33`, árvore `65b7030c80948824c5740ce3b554bc20e026b505`. A árvore local coincide integralmente; não havia arquivos pendentes. `main` está na 0.6 (`06a2165`); PRs #2 (0.7A), #3 (0.7B) e #4 (0.7C) continuam abertos e empilhados. Branch desta etapa: `feat/aurora-08-sao-jorge`, PR-base apropriado: `feat/aurora-07c`.

Antes de editar produto: **82/82 unitários e build aprovados**. Existe aviso de tamanho do chunk Three, já documentado na 0.7C. A suíte integrada existente cobre campanha, três aventuras, cutscenes, câmera, controles móveis, salvamento e memória.

## Sistemas e restrições

- Uma única cena, câmera FollowCamera e Controls; personagens GLB via pool assíncrono, animações e cache. Reutilizar, sem outro jogador/renderizador.
- `physics.js` resolve movimento em X/Z e limites globais. Ignora Y dos sólidos: não pode receber simultaneamente colisores de todos os pisos. O novo gestor deve selecionar o piso ativo.
- `FollowCamera` usa foco Y absoluto 1,42. Deve passar a considerar Y do personagem para os andares superiores, mantendo o comportamento no térreo.
- `world`, `story-world`, `living`, `adventure`: coordenadas narrativas legadas e rotinas já funcionais. Não remapear em M1; isso pertence ao M3 solicitado. A visita São Jorge usa a mesma cena/jogador/câmera e guarda/restaura a campanha. Não é um visualizador separado nem cópia dos sistemas narrativos.
- Saves v04 validam apenas X/Z legados. Adicionar estado separado e validado da visita; não sobrescrever posição/capítulos/recompensas antigos enquanto visita. Backup antes de introduzir o novo campo.
- InteractionRegistry considera distância X/Z e linha de visão. Durante visita só registrar alvos do novo espaço/piso; nunca ativar NPC ou livro legado escondido por coincidência X/Z.
- Materiais Colorbeat, três presets, contorno seletivo, culling e descarte devem continuar compartilhados.

## Recursos auditados

Lidos `00_COMECE_AQUI.md`, `01_PROMPT_CODEX.md`, quatro documentos, JSON de proveniência, HTML e os dois croquis originais. Quatro GLBs válidos glTF2, sem texturas, animações, materiais nomeados ou normais; cada arquivo é uma malha única com `POSITION`/`COLOR_0`. Pisos individuais: 287.416 / 228.664 / 64.644 bytes; combinado: 578.732 bytes. A escala horizontal conceitual vai de ±11,275 em X e ±19,275 em Z. A altura das paredes é de maquete cortada (~1,95), insuficiente para uma câmera de personagem. Não é escala real confirmada.

O HTML contém inventário explícito de caixas e ambientes, extraído como dados JSON sem executar scripts. Permite reorganizar os mesmos modelos por camadas, reparar passagens e gerar colisões coerentes. O salão original contém palco/foyer propostos; estes devem ser removidos/desativados. Números 201 etc. são hipóteses: na interface usar nomes genéricos e IDs de jogo.

## Escopo aprovado pelo pedido

M1 somente: auditoria, estrutura importada/ajustada, três pisos exploráveis, portas/passagens de jogo, transições em patamares de escada ficcionalizados, câmera, colisões, inspeção 1º/2º/3º/todos, persistência da visita, testes e capturas. A campanha 0.7 permanece disponível e intacta. M2/M3/M4 completos, decoração premium e remapeamento narrativo permanecem pendentes; não declarar toda a 0.8 concluída.
