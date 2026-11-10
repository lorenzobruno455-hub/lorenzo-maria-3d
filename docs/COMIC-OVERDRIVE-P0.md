# Comic Overdrive — P0 para revisão visual

## Base conferida no GitHub

Em 10/11/2026: `main` em `f05e1c0` (0.8); PR #9 / 0.8.1 em `50db300`; #10 trata PWA; #11 / 0.8.2 em `9132f87`; #12 / mundo contínuo e recuperação 0.9.1 em `92ceca8`. Esses PRs estavam abertos. A base deste trabalho é **`92ceca84c27d2943673aea4190442250c36a0513`**, branch `feat/aurora-09-continuous-world`, não a main antiga. O histórico da base registra regressão 82/83 e timeout intermitente no helper Android de escadas; o rerun focado passou. Este P0 não modifica nem declara resolvido esse teste.

Branch: `feat/aurora-comic-overdrive-p0`. Nenhum merge, alteração de main ou publicação. O documento PROJECT_AURORA_COMIC_OVERDRIVE_CODEX.md foi lido integralmente; apenas seu P0 foi executado.

## Demonstração e inventário parcial

Ativar **`?comic=overdrive-p0`** na URL local. Sem o parâmetro, permanece a apresentação 0.9.1. O protótipo reaproveita `ColorbeatMaterials`, toon ramp, shaders, contornos e recursos existentes; o único ponto novo no cache de materiais é um callback opcional. Não é um filtro de saturação nem uma substituição do renderizador.

| Categoria / responsável | Antes | Depois no P0 / evidência | Pendente |
|---|---|---|---|
| Céu, nuvens, sol / `comic-overdrive-p0.js` | Fundo atmosférico existente | Céu em três faixas; 12 nuvens gráficas e um sol em um atlas procedural original 512×128; vista campus | P1: distribuição e vistas longas em todo o mundo |
| Árvores e floresta / mesmo módulo + recursos compartilhados | Copa facetada com vários volumes pequenos | Uma árvore em (10,13), três massas verdes/turquesa/limão, contorno e sombra desenhada; vista campus | P1: demais árvores, troncos e floresta |
| Grama, chão e caminho / materiais Colorbeat | Verde e piso pouco expressivos | Pigmentos limão/esmeralda, sombras em blocos no recorte; campus e conexão | P1: vegetação baixa, flores e percurso completo |
| Campus e fachada São Jorge / shader compartilhado | Materiais toon da 0.9.1 | Três bandas, sombras cromáticas e hachura seletiva; preservada a identidade clara da parede; conexão | P1/P2: resto da arquitetura |
| Escola e decoração / cache de materiais e atlas existente | Acabamento 0.8.2 | Somente sala A `sj-f1-01`: madeira quente, móveis, lousa e cartazes com UV/textos existentes; vista interior | P2: demais salas, corredores e três pavimentos |
| Biblioteca, laboratório, administração, cinema, salão | Implementação herdada preservada | Sem aplicação ampla neste marco | P2: estilizar objetos existentes e manter memórias distinguíveis |
| Personagens / toon + contorno existente | Sete GLBs com rigs e animação existentes | Figura existente nos recortes: três bandas, sombra de pele preservando matiz quente, contorno reforçado; campus/interior | P3: revisão individual dos sete, rostos e cinematics |
| UI / `comic-overdrive-p0.css` | HUD Colorbeat | Amostra de paleta/contorno no HUD e controles; sem mudar tamanho, posição ou área touch | P3: menus, diálogos, álbum e cutscenes/VFX |
| Presets / sistema `quality` existente | Baixo, Médio, Alto | Mesma identidade em todos; smoke alterna os três, mantendo controles | P4: polimento, cobertura completa, regressão e dispositivos físicos |

Tokens originais: céu `#02B9FF`, cobalto `#2352FF`, sol `#FFE238`, laranja `#FF8A28`, coral `#FF5A4B`, rosa `#FF3D9A`, violeta `#9655F5`, limão `#75E83D`, esmeralda `#22CC79`, turquesa `#18D6CC`, noite `#19264D`, tinta `#131A2A`, papel `#FFF3D7`, luz `#FFFDF3`. Regras: três valores por pigmento, sombras coloridas, hachura apenas em materiais selecionados e nunca na pele, hierarquia entre papel claro/objeto colorido/tinta escura. Luzes, exposição e relógio não foram intensificados para as capturas.

Os limites são explícitos: campus x[-14,14], z[8,26]; fachada/conexão x[40,74], z[18.6,26]; sala A usa os limites da matriz existente e transformação da origem escolar (60,0,0). Bordas suavizadas em 0,45 unidade evitam uma linha totalmente dura, mas o recorte continua perceptível. O céu e a amostra do HUD são globais apenas enquanto a flag está ligada. Não houve implantação visual global de P1–P4.

## Capturas reais, antes/depois

| Vista | Antes: 0.9.1 | Depois: P0 |
|---|---|---|
| Campus, céu e árvore | [Antes](captures/comic-overdrive-p0/campus-before.jpg) | [Depois](captures/comic-overdrive-p0/campus-after.jpg) |
| Caminho e fachada São Jorge | [Antes](captures/comic-overdrive-p0/connection-before.jpg) | [Depois](captures/comic-overdrive-p0/connection-after.jpg) |
| Sala A, ator, móveis e cartazes | [Antes](captures/comic-overdrive-p0/class-a-before.jpg) | [Depois](captures/comic-overdrive-p0/class-a-after.jpg) |

Seis JPEGs do jogo, sem mockups. Mesmas posições/yaw/pitch e distância de câmera, viewport 960×600, preset Médio, sombras ligadas, resolução adaptativa desligada, exposição 1 e relógio 08:15. Estado de memória idêntico. Personagens animados podem estar em fases diferentes; não foi alterada a lógica de animação para sincronizar as poses. A captura congela o quadro pela pausa, ocultando somente seu overlay, da mesma forma nas duas versões.

## Custo e verificações

Medições brutas e posições: [antes](captures/comic-overdrive-p0/before-metrics.json), [depois](captures/comic-overdrive-p0/after-metrics.json). Coleta final do mesmo código entregue:

| Vista | Draw calls antes → depois | Triângulos antes → depois | Geometrias | Texturas | p50 / p95 ms antes → depois* |
|---|---:|---:|---:|---:|---:|
| campus | 214 → 219 | 247,492 → 248,180 | 129 → 131 | 33 → 34 | 533.2 / 916.6 → 633.2 / 1433.4 |
| connection | 114 → 116 | 201,676 → 201,870 | 117 → 118 | 12 → 13 | 650.0 / 1316.7 → 883.3 / 1766.7 |
| class-a | 85 → 87 | 121,608 → 121,802 | 156 → 160 | 16 → 20 | 500.0 / 983.3 → 833.3 / 1749.9 |

*Tempos do renderizador de software, não do Android.

Há dois meshes instanciados para copa/contorno e um para as 13 cartas de céu; geometrias/materiais existentes continuam compartilhados. Nenhuma luz ou shadow map adicional. Um atlas novo, nenhuma textura de alta resolução por cartaz. Recursos próprios, buffers de instância e callbacks emprestados são liberados/restaurados ao desmontar. A seleção de pisos, leases e carregamento progressivo da escola permanecem existentes.

Chromium/SwiftShader, sem GPU de celular: os JSONs incluem intervalos brutos de 20 frames ativos após aquecimento e p50/p95. O p50 aumentou aproximadamente 19% no campus, 36% na conexão e 67% na sala; o baixo aumento de draws não elimina o custo de fragment shader. A residência de geometrias/texturas inclui o streaming existente, não apenas recursos adicionados. Há alta variância; esses tempos **não são FPS de Android nem prova de fluidez física**. Validar em aparelho antes de expandir o efeito.

Build final: main 385,99 kB / gzip 107,10 (base 374,96 / 102,54); CSS 41,76 / 9,17 (base 40,76 / 8,95); Three 569,75 / 148,04 (base 568,97 / 147,87). O aviso já existente de chunk Three maior que 500 kB permanece. Sem dependências novas.

Passaram **14 testes unitários focados**, **2 smokes reais de navegador** e o build. Cobertura: composição/restauração de shader, skinning e instancing, escopo espacial, contraste dos tokens, compilação dos sete modelos, atlas e sombras, colisores idênticos, movimento, campanha preservada, ponto seguro e joystick por eventos touch reais em viewport Android. Baixo conserva os limites existentes de <160 draw calls e <110 geometrias na cena inicial. Sem aparelho físico conectado. Não foi repetida a regressão completa, reservada pelo documento para P4.

```sh
npm run build
node --test tests/unit/comic-overdrive-p0.test.js tests/unit/colorbeat.test.js tests/unit/colorbeat081.test.js tests/unit/ink081.test.js tests/unit/school-materials.test.js
npx playwright test tests/comic-overdrive-p0.spec.js --reporter=line
```

Neste ambiente, o smoke usa a configuração local ignorada `work/aurora082/playwright.config.mjs` para apontar ao Chromium do sistema. Para reproduzir as imagens com o Vite em localhost:5173:

```sh
CHROMIUM_PATH=/usr/bin/chromium node scripts/capture-overdrive-p0.mjs before
CHROMIUM_PATH=/usr/bin/chromium node scripts/capture-overdrive-p0.mjs after
```

`before` abre o modo original sem a flag; `after` abre o mesmo jogo com P0. Os JSONs entregues identificam também o commit usado na coleta original de cada fase.

## Referências e limites de entrega

Consulta visual: [site oficial Hi-Fi RUSH](https://hifirush.krafton.com/pt-br/) e [entrevista técnica da Unreal Engine](https://www.unrealengine.com/developer-interviews/hi-fi-rush-was-inspired-by-shaun-of-the-dead-and-futurama?lang=en-US). Extraídos princípios de silhuetas, cores limpas, céu azul, valores de sombra separados e contraste; nenhuma imagem, personagem, logo, textura, fonte ou áudio dessas fontes entrou no jogo. Nuvens, sol e regras de pigmento são procedurais originais; os GLBs do projeto não foram alterados.

Mundo contínuo, coordenadas, três pavimentos, missões, seis memórias, sete personagens, schemas/chave dos saves v04, câmera, controles Android e PWA não foram reimplementados. O checkpoint 0.9.1 continua sendo exercitado pelo smoke. A amostra visual ainda requer julgamento do proprietário, especialmente sombras dos atores, hachura da fachada e intensidade no interior.

**P0 encerrado para revisão. P1–P4 não iniciados. Aguardar aprovação visual antes de ampliar a estética.**
