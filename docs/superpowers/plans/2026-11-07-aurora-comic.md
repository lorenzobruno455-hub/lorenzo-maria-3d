# Aurora Comic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar a direção visual Hi-Fi RUSH aprovada em interface e mundo, com identidade própria de Lorenzo & Maria.
**Architecture:** Materiais toon e rampa compartilhada, contornos seletivos e agrupados, fontes locais e componentes CSS próprios sobre os controles existentes. A apresentação consome eventos reais e estado de câmera/qualidade, sem reescrever a campanha.
**Tech Stack:** Three.js r181, JavaScript, Vite, CSS, Playwright, node:test.
**Spec:** docs/REFERENCIAS-HIFI-RUSH.md (aprovada pelo usuário nesta conversa).

## Global Constraints

- Preservar textos originais, seis memórias, missões, escolhas, recompensas, salvamento e multitouch.
- Manter Baixa/Média/Alta e resolução adaptativa; vista baixa existente com menos de 160 draw calls.
- Fontes gratuitas licenciadas hospedadas localmente; recursos gráficos próprios.
- Proporções humanas provisórias, sem inventar aparência biográfica.
- Movimento reduzido e leitura contrastada; alvos de toque retangulares apesar dos recortes decorativos.

## Review Focus

- Contraste de foco/seleção e leitura sobre cena clara: testar menus e diálogo.
- Livro aberto em Android horizontal: painel e objeto precisam permanecer legíveis.
- Contornos não podem duplicar sombras nem incluir auxiliares F3 ou instâncias de vegetação.
- Qualidade alterada repetidamente não deve alocar novos contornos ou rampas.
- Pausa, página oculta e movimento reduzido devem interromper animação decorativa.

## Task 1: Materiais e contornos do mundo

**Files:** src/systems/resources.js, src/systems/batching.js, src/systems/ink-outlines.js, src/main.js, src/systems/world.js, src/systems/story-world.js, tests/unit/comic.test.js.
**Interfaces:** Resources.material mantém assinatura e passa a produzir MeshToonMaterial compartilhado; InkOutlines(scene, resources, actors) expõe update(quality, position) e dispose().
- [ ] Escrever testes de sombreamento toon real/rampa compartilhada e marcação das malhas estáticas; executar e observar falhas.
- [ ] Implementar rampa de três faixas e revisão de cores/texturas, incluindo placas/capas; criar contorno arquitetônico agrupado e silhuetas articuladas seletivas.
- [ ] Verificar descarte, alternância de qualidade, orçamento de renderização e ausência de regressões unitárias; commit.

## Task 2: Componentes gráficos e tipografia

**Files:** public/fonts/*, src/comic.css, src/main.js, index.html, src/systems/dialogue.js, src/systems/story.js, tests/comic.spec.js.
**Interfaces:** Classes ComicPanel/ActionRibbon aplicadas ao DOM atual, sem alterar IDs nem eventos; feedback e animação baseados nos estados reais.
- [ ] Escrever cenários de fontes locais, seleção/foco, movimento reduzido e layouts diálogo/menu em 844×390 e 390×844; executar e observar falhas relevantes.
- [ ] Integrar fontes Barlow Condensed e Atkinson Hyperlegible com OFL; implementar painéis angulares, HUD, escolhas, álbum, feedback de descoberta e ajustes de leitura.
- [ ] Verificar cada cenário, rolagem, foco e toque; commit.

## Task 3: Composição, integração e entrega

**Files:** src/systems/camera.js, src/systems/character.js, scripts/capture-comic.mjs, docs/ENTREGA-VISUAL-COMIC.md, docs/captures/comic/*.
**Interfaces:** Preservar FollowCamera e seus obstáculos; enquadramento narrativo continua orientado pelo objeto/interlocutor.
- [ ] Capturar interface e ambientes reais e inspecionar sombras, silhuetas e textos; para falhas comportamentais encontradas, reproduzir em teste antes da correção.
- [ ] Executar suíte unitária, suíte completa de navegador e build de produção; solicitar revisão independente do ramo.
- [ ] Corrigir problemas importantes comprovados, documentar limitações e publicar os arquivos na conta lorenzobruno455-hub já autorizada.
