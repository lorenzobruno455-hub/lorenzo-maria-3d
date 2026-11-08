# Project Aurora 0.7A — entrega

A 0.7A concentra personagens, materiais e sala de aula. Não acrescenta missões nem conteúdo narrativo. Publicação por `feat/aurora-07a` e Pull Request; main não foi alterada.

## Modelos realmente implementados

`public/models/aurora/lorenzo.glb` e `maria.glb` foram **gerados no Blender 4.3.2, carregados e renderizados no jogo**. Não são apenas scripts ou URLs futuras. Avatares fictícios originais: cabeça com perfil de mandíbula/testa, cabelo tridimensional, olhos/íris/sobrancelhas, nariz, boca, orelhas, mãos com dedos, sapatos com cadarços/sola, gola, punhos, bolso, costuras e brasão original. Os dois compartilham a linguagem do uniforme e têm cores, cabelo e altura configuráveis. Não há afirmação de semelhança com pessoas reais.

Cada arquivo contém uma armature de 18 bones e 11 clips: Idle, Walk, Run, Talk, Interact, Turn, Sit, Stand, Wave, Observe e React. O jogo usa AnimationMixer e crossfade ao mudar de estado. Cabelo e acessórios acompanham o esqueleto. A boca tem um bone simples animado em Talk, não lip sync.

O Blender pode regenerar os arquivos com `blender -b --python scripts/blender/build_aurora.py`; o jogador não precisa instalar Blender. Paletas de autoria no script; URLs, altura e overrides de materiais em `src/character-assets.js`.

## Pipeline

`GLBAssets` carrega assíncrono, compartilha templates/geometrias/materiais, clona esqueletos independentes, normaliza altura e origem nos pés mantendo transformações de autoria. Primitivas de material compatíveis são reunidas numa geometria skinned com grupos. Posições salvas ocupadas por novos móveis são recuperadas numa vizinhança limitada, antes de recorrer ao pátio. Leases liberam esqueletos sem invalidar geometrias de outros personagens. Cache e Resources descartam os recursos GPU nos respectivos donos.

`Character.loadGLB` mantém o modelo jogável em falhas, rejeita dimensão inválida e impede que carregamentos antigos ou concluídos após teardown voltem à cena. Trocar um GLB no manifesto não altera missão/movimentação. NPCs secundários mantêm seus modelos procedurais leves.

## Sala, materiais e luz

- Carteiras/cadeiras com bordas suavizadas, estrutura metálica, travessas, suportes, pés de borracha e fixadores; aproveitamento de geometrias e agrupamento estático por material.
- Quadro transferido da parede de janelas para parede sólida; disposição da turma voltada à parede de ensino. Cortinas com dobras, caixilhos, peitoris, armário com puxadores, aparador apoiado no piso, mochilas, ventiladores e cartazes originais de escola fictícia brasileira.
- Apoios e colisores métricos preservam a entrada e a circulação; missões e objetos interativos anteriores permanecem acessíveis.
- Colorbeat unificado: rampa toon compartilhada, tinta arquitetônica e contornos seletivos skinned. Metal/vidro usam materiais físicos; tecido recebe textura procedural discreta. Luz solar e preenchimentos existentes sem novos mapas de sombra ou pós-processamento pesado.
- Corrigida a faixa escura artificial em superfícies voltadas contra o sol: a primeira faixa da rampa não introduz luz direta nessas superfícies; ambiente/preenchimento preservam leitura.
- Interface anterior, fontes OFL locais e feedback Colorbeat integrados; painel de álbum em retrato cabe na largura disponível.

## Verificação

- `npm run test:unit`: **49/49 aprovados**. Inclui GLBs reais, skins/bones/clips, clones independentes, GPU compartilhada/descarte único, dimensão inválida, transformações/pivô, carregamento tardio/superseded, fallback, posição salva e mobiliário.
- `PLAYWRIGHT_BROWSERS_PATH=/workspace/work/browsers npm test -- --workers=2`: **43/43 aprovados** (9,3 min, Chromium/SwiftShader). Movimento, corrida, câmera/oclusão, colisões, portas, multitouch, retrato/paisagem, diálogos, todas as seis memórias/recompensas, minijogos, livro, assento, salvamento e orçamento Baixa.
- Os dois GLBs efetivamente carregam e animam, o protagonista tem contorno real na Baixa, sem registros do fallback oculto. Falhas de request mantêm exploração e interação.
- Clips amostrados dos GLBs: Wave realmente eleva a mão acima do ombro; Sit dobra joelhos para +Z e mantém os pés próximos ao piso na pose base.
- `npm run build`: **aprovada**; inclui os dois GLBs em `dist/models/aurora`. Bundle principal aproximadamente 756 kB / 212 kB gzip, CSS 30,5 kB / 7,1 kB gzip. Há o aviso conhecido de chunk acima de 500 kB; não há erro de build.
- `node scripts/smoke-production.mjs` contra Vite Preview em 4173: **aprovado**. Os dois GLBs retornaram HTTP 200, a build iniciou e o canvas renderizou sem erros.
- Capturas reais inspecionadas, sem erros de runtime/shader. Revisão independente concluída; os achados de registro de contorno e eixo do aceno foram reproduzidos e corrigidos com testes.
- A regressão intermediária 42/43 revelou um save dentro de uma carteira girada. A recuperação próxima de posição passou no teste original do caderno; nenhuma missão ou teste existente foi removido para acomodar o novo layout.

Não se inferem FPS de aparelhos físicos a partir do Chromium de testes.

## Capturas comparativas reais

| Tema | Antes | Depois |
|---|---|---|
| Sala, mesma posição/câmera e qualidade Média | [Sala anterior](captures/07a/classroom-before.png) | [Sala 0.7A](captures/07a/classroom-after.png) |
| Biblioteca / sombras | [Biblioteca anterior](captures/07a/library-before.png) | [Biblioteca 0.7A](captures/07a/library-after.png) |
| Protagonistas | [Dupla procedural preservada](captures/07a/avatars-before.png) | [Dois GLBs no renderer Three.js](captures/07a/avatars-after.png) |

A captura da dupla usa `scripts/preview-avatars.html`, com os mesmos Character, GLBAssets e InkOutlines do jogo; é um mostruário técnico, não uma tela nova de jogo. O modo `?before` do mostruário renderiza os manequins procedurais preservados no fallback; não é uma captura antiga de uma tag publicada. Ambientes são capturados na experiência de exploração real, ocultando o HUD após pausa. Scripts não introduzem teletransporte de produção.

Para reproduzir as capturas 0.7A: `PLAYWRIGHT_BROWSERS_PATH=<diretório-local-opcional> node scripts/capture-aurora.mjs`, com o servidor Vite ativo. [Parede de ensino](captures/07a/classroom-teaching-wall.png) mostra o novo quadro fora da parede de janelas.

## Limitações e próximas prioridades

- Avatares são uma melhoria original estilizada e personalizável. Não substituem uma direção artística aprovada por referências autorizadas nem modelos de produção feitos por um character artist. Não há IK, captura de movimentos, rig facial completo, física de roupa/cabelo ou animação de dedos. O alinhamento fino do protagonista nos assentos legados ainda requer calibração; a pose foi corrigida para dobrar os joelhos para a frente, mas não há ajuste automático de contato por altura do assento.
- NPCs secundários seguem procedurais. Contornos são seletivos; não há pós-processamento de linhas sobre toda a cena. Modelos externos com morph targets, materiais especiais e texturas exigem inspeção antes de substituir os originais.
- Sala usa modelagem e texturas originais leves; não usa packs comerciais nem materiais PBR 4K. Vidros são estilizados e iluminação não é global illumination.
- Não foram medidos Galaxy A35/S24 Ultra nem um Chromebook físico. Teclado/mouse e emulação Android no Chromium são verificados, sem promessa de FPS ou temperatura no aparelho.
- A build conserva aviso de bundle JavaScript maior que 500 kB. Separar melhor o carregamento inicial e medir em hardware real são prioridades técnicas seguintes.
- A 0.7B deve desenvolver os sistemas narrativos pedidos em uma etapa separada. Antes disso: revisão visual do usuário, calibração de silhuetas/poses e teste físico Android.

Veja [auditoria](AUDITORIA-07A.md) e [inventário de licenças](ASSET-LICENSES.md).

## Arquivos centrais

| Área | Arquivos |
|---|---|
| GLBs e fonte de modelagem | `public/models/aurora/{lorenzo,maria}.glb`, `scripts/blender/build_aurora.py`, `src/character-assets.js` |
| Importação e animação | `src/systems/asset-pipeline.js`, `character.js`, `ink-outlines.js`, `src/main.js` |
| Sala e materiais | `src/systems/classroom.js`, `world.js`, `prop-library.js`, `resources.js`, `campus-world.js` |
| Compatibilidade de saves | `src/systems/physics.js` e inicialização em `src/main.js` |
| Interface integrada anterior | `src/comic.css`, `src/colorbeat-effects.css`, `index.html`, fontes e respectivas licenças |
| Testes novos | `tests/aurora07.spec.js`, `tests/shading.spec.js`, `tests/unit/aurora-assets.test.js`, `aurora-lifecycle.test.js`, `classroom.test.js` |
| Evidências e reprodução | `scripts/capture-aurora.mjs`, `scripts/preview-avatars.html`, `docs/captures/07a/` |
| Documentação | `AUDITORIA-07A.md`, `ASSET-LICENSES.md`, `ENTREGA-07A.md`, plano e README |

O PR também incorpora a etapa Aurora Comic anteriormente preparada, preservando o Colorbeat 0.6 remoto. O CSS alternativo e sua classe de contorno continuam disponíveis para compatibilidade, mas não são ativados junto com o renderer unificado, evitando dois contornos sobre o mesmo personagem.
