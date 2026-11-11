# Comic Overdrive — P3 + P4

## Base e implementação

Base conferida no GitHub: PR #14, `5379b7646ec26b35bf06932fb3ea154e782eb891`, ainda em rascunho, sobre P0/#13 e 0.9.1/#12. Branch: `feat/aurora-comic-overdrive-p3-p4`. P3/P4 foram autorizados juntos nesta execução. Main, hospedagem e PRs anteriores não foram alterados.

P3 introduz perfis **opt-in** de pele, cabelo e olhos no cache Colorbeat, escolhidos pelos nomes dos materiais originais dos GLBs. Pele usa dois valores próximos, sem matiz azul nem hachura; cabelo mantém sua cor original em dois valores; olhos mantêm o pigmento original. Os sete GLBs, geometria, proporções, rigs, clipes e arquivos não foram modificados. Uniformes continuam no perfil de tecido. Os contornos existentes conservam largura por preset, skinning e exclusão dos grupos de pele/olhos; o limite em unidades de mundo passa a 0,024 no perfil final, mantendo o afinamento distante.

Uma camada CSS, limitada a `body.comic-overdrive`, unifica os painéis de papel/tinta, acentos coral/cobalto/aqua/amarelo, abertura, HUD, pausa, configurações, álbum, inventário, escolhas, leitura, carta e atividades existentes. Cutscenes recebem moldura/título gráficos; efeitos de ação usam os eventos já existentes e continuam limitados a dois nós, sem novo temporizador, áudio ou flash. Texto narrativo, nomes, datas, fontes e áreas de toque permanecem. Movimento reduzido e alto contraste são respeitados; não foram inventadas novas telas ou missões.

P4 filtra a hachura pela derivada de sua frequência projetada, reduzindo-a antes de o traço ficar subpixel. Baixo desativa somente essa decoração, mantendo cores e bandas toon; Médio/Alto usam o mesmo perfil visual. Não há pós-processamento novo, luz adicional, nova textura ou nova geometria. Preservada a redução de fundo da inspeção geral dos três pisos da entrega anterior.

Modos de comparação: padrão = P3/P4; `?comic=overdrive-p1-p2` = apresentação anterior; `?comic=overdrive-p0` = amostra limitada; `?comic=legacy` = 0.9.1 sem Overdrive. Os scripts históricos continuam apontando aos modos correspondentes.

## Cobertura visual

| Categoria | Implementação / verificação |
|---|---|
| Céu, horizonte, nuvens, sol | Atlas e céu de P1 preservados; vista campus |
| Árvores, vegetação, grama, flores | Copas instanciadas e pigmentos de P1 mantidos; culling e recursos compartilhados preservados |
| Chão/caminhos/campus | Perfil global com hachura filtrada; comparação campus e testes da ligação física |
| São Jorge exterior e 24 ambientes/3 pisos | Materiais e matriz de P2 mantidos; filtragem aplicada às superfícies existentes, sem mover objetos |
| Biblioteca, laboratório, administração, cinema | Perfil compartilhado de P2; ver inventário e vistas anteriores em [P1/P2](COMIC-OVERDRIVE-P1-P2.md); livros narrativos não foram substituídos |
| Salão | Mesma geometria e função multiuso; hachura distante atenuada, comparação dedicada |
| Sete personagens | Lorenzo, Maria, Bia, Caio, Helena, Davi e Lia preservados; perfis por papel, cache comum, clipes/skinning verificados |
| Menus/HUD/pausa/configurações | Contraste, foco, papel/tinta e acentos; mesmas áreas de interação e safe areas herdadas |
| Inventário/álbum/conquistas/jogos/carta/histórico | Mesmas janelas/componentes e permissões; novo acabamento, sem mudança de conteúdo |
| Diálogo/escolhas/leitura | Corpo de texto sem deformação; nomes e procedência legíveis; contraste medido em navegador |
| Cutscenes/VFX/transições | Moldura e efeitos originais nos eventos existentes; pausar/pular e reduced-motion preservados |
| Créditos/licenças | Documentos existentes preservados; o menu auditado não possui rota própria de créditos, não foi inventada uma |
| Baixo/Médio/Alto | Mesmas cores/bandas; orçamento e contornos selecionados preservados, hachura decorativa desligada no Baixo |

## Capturas reais

| Vista | P1/P2 | P3/P4 |
|---|---|---|
| Personagem/sala | [Antes](captures/comic-overdrive-p3-p4/character-before.jpg) | [Depois](captures/comic-overdrive-p3-p4/character-after.jpg) |
| Salão/distância | [Antes](captures/comic-overdrive-p3-p4/hall-before.jpg) | [Depois](captures/comic-overdrive-p3-p4/hall-after.jpg) |
| Campus | [Antes](captures/comic-overdrive-p3-p4/campus-before.jpg) | [Depois](captures/comic-overdrive-p3-p4/campus-after.jpg) |
| Abertura Android | [Antes](captures/comic-overdrive-p3-p4/menu-before.jpg) | [Depois](captures/comic-overdrive-p3-p4/menu-after.jpg) |
| Diálogo Android | [Antes](captures/comic-overdrive-p3-p4/dialogue-before.jpg) | [Depois](captures/comic-overdrive-p3-p4/dialogue-after.jpg) |
| Configurações Android | [Antes](captures/comic-overdrive-p3-p4/settings-before.jpg) | [Depois](captures/comic-overdrive-p3-p4/settings-after.jpg) |
| Álbum Android | [Antes](captures/comic-overdrive-p3-p4/album-before.jpg) | [Depois](captures/comic-overdrive-p3-p4/album-after.jpg) |
| Cutscene Android | [Antes](captures/comic-overdrive-p3-p4/cinematic-before.jpg) | [Depois](captures/comic-overdrive-p3-p4/cinematic-after.jpg) |

16 JPEGs reais. Vistas 3D: 960×600, Médio, sombras ligadas, exposição 1, adaptive desligado, relógio 08:15, mesmas posições/yaw/pitch e câmera com diferença residual <0,001 unidade. UI: 844×390, mesmo estado de save, viewport e reduced-motion; configurações mostradas no topo da área rolável, cinematics pausadas no mesmo início. Fases de animação podem diferir. Sem mockup, edição de pixels ou assets de Hi-Fi RUSH.

| Vista | Draw calls antes → depois | Triângulos antes → depois | Geometrias | Texturas |
|---|---:|---:|---:|---:|
| character | 88 → 88 | 122762 → 122762 | 156 → 156 | 17 → 17 |
| hall | 73 → 73 | 55810 → 55810 | 142 → 145 | 28 → 31 |
| campus | 217 → 217 | 240006 → 240006 | 129 → 129 | 34 → 34 |

Dados completos: [antes](captures/comic-overdrive-p3-p4/before-metrics.json), [depois](captures/comic-overdrive-p3-p4/after-metrics.json). Geometrias/texturas residentes incluem streaming e alocações preexistentes. Tempos de oito frames por vista em Chromium/SwiftShader são amostras de software, não FPS de Android/Chromebook físico.

Build: main **390,21 kB / gzip 108,66**, CSS **47,41 / 9,93**, Three **569,75 / 148,04**. P1/P2: main 389,04 / 108,26, CSS 41,76 / 9,17, Three igual. Permanece o aviso preexistente de chunk Three >500 kB. Nenhuma dependência nova.

## Validação

Local: **159/159 unitários**, build e **6/6 testes focados de navegador** passaram. Cobertura: cores/roles opt-in, propriedade dos recursos e restauração, skinning/contornos, sete modelos, presets, diálogos/contraste, páginas secundárias, 844×390/390×844, alto contraste, movimento reduzido e tela cheia. As capturas finais também concluíram sem erro de shader/console. Revisão independente do novo diff não encontrou defeitos acionáveis.

O helper de regressão antes fazia oito pequenos arrastos para duas rotações grandes; agora faz dois arrastos com captura de ponteiro, mantendo eventos reais, yaw final e movimento comum. Não há escrita direta de posição/câmera nem mudança na física. Isso trata a latência de automação observada nos dois roteiros longos anteriores **sem aumentar os timeouts individuais dos testes ou remover verificações**; o resultado desses roteiros deve ser confirmado pela regressão final, não presumido pelo smoke.

A regressão geral final usa o [workflow existente](https://github.com/lorenzobruno455-hub/lorenzo-maria-3d/actions/workflows/colorbeat-validation.yml), em **quatro partes disjuntas**, um worker por parte. Foi acrescentada a branch-base atual ao gatilho de PR; não há deploy no workflow. A primeira rodada concluiu todos os 23 testes da parte narrativa em 17,6 minutos, mas o limite agregado de 18 minutos encerrou o job na finalização. A janela do job de navegador passa a 22 minutos para incluir preparação e artefatos; os limites individuais de 90/240/300 segundos, assertions e budgets de renderização não foram aumentados. Outra falha era a expectativa antiga do amarelo do botão Iniciar; ela foi alinhada à paleta aprovada e o teste completo passou isoladamente. A execução final dos checks inclui esses dois ajustes de QA. O resultado final, SHA e logs são rastreáveis nos checks e descrição do PR. Não interpretar esta documentação de preparação como afirmação de CI verde antes da conclusão dos jobs.

```sh
npm run test:unit
npm run build
npx playwright test tests/comic-overdrive-p3-p4.spec.js tests/colorbeat081-final.spec.js tests/fullscreen.spec.js
```

No ambiente de execução, a configuração ignorada `work/aurora082/playwright.config.mjs` aponta ao Chromium instalado. Para reproduzir as imagens com Vite em localhost:5173:

```sh
CHROMIUM_PATH=/usr/bin/chromium node scripts/capture-overdrive-p3-p4.mjs before
CHROMIUM_PATH=/usr/bin/chromium node scripts/capture-overdrive-p3-p4.mjs after
```

## Verificação física ainda necessária

Não há Android ou Chromebook físico conectado ao ambiente. Não certificar FPS, temperatura, autonomia ou desempenho do S24 Ultra/A35 a partir do SwiftShader. No aparelho, manter a mesma origem para os saves e conferir:

- Baixo/Médio/Alto: rostos legíveis em caminhada/corrida, hachura distante estável e controles livres em paisagem/retrato.
- Joystick + câmera + correr simultâneos; tela cheia/PWA conforme suporte do Chrome/sistema.
- Campus → porta → três pisos → retorno; NPCs, missões e seis livros disponíveis.
- Salvar/reabrir dentro e fora da escola; retorno ao ponto seguro e pausa/pular cutscene.

Mundo contínuo 0.9.1, checkpoint, matriz, orientação, escadas, dados narrativos, saves v04, câmera/controles e PWA permanecem. Nenhuma publicação, merge ou alteração da main foi feita. Fechamento automatizado e teste físico são evidências distintas.

## Atualizar no Chromebook

Pare o servidor antigo com Ctrl+C. O bloco procura a cópia existente na sua pasta pessoal e usa a mesma porta para evitar uma mudança silenciosa de origem:

```sh
(
projeto_lm="$(find "$HOME" -type d -name lorenzo-maria-3d -print -quit 2>/dev/null)"
if [ -z "$projeto_lm" ]; then
  projeto_lm="$HOME/lorenzo-maria-3d"
  git clone https://github.com/lorenzobruno455-hub/lorenzo-maria-3d.git "$projeto_lm" || exit 1
fi
cd "$projeto_lm" || exit 1
git fetch origin &&
git switch feat/aurora-comic-overdrive-p3-p4 &&
git pull --ff-only origin feat/aurora-comic-overdrive-p3-p4 &&
npm ci && npm run build && npm run dev -- --port 5173 --strictPort
)
```

Usar a mesma URL/origem e navegador de antes conserva os saves locais. Esses comandos não atualizam a hospedagem pública.
