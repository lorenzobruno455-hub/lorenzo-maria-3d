# Aurora 0.9.3 — polimento, desempenho e quadra

Base: `15bfaac` / `feat/aurora-092-continuous-world`, PR #20. Branch: `fix/aurora-093-polish-performance`. Sem merge ou deploy.

## Registro de decisões

- Reutilizar motores atuais; não mudar chave/formato de save ou fatos históricos. Não atribuir os engasgos ao autosave antes de medir.
- A* apresentou buscas síncronas de 504 ms nas escadas e 1547 ms na quadra. Uma redução de obstáculos por vizinhança preserva as regras de colisão; um único worker compartilhado executa as buscas fora da thread de input/render. Os segmentos e alturas da rota assíncrona são iguais aos da rota síncrona nos testes. Sem biblioteca nova ou pathfinder por personagem.
- A fachada fotográfica estava na face mundial oposta ao campus. Mover somente acabamento e letreiro, abrindo o acabamento no portal já existente. Prédio, salas, orientação esquerda/direita, três portões e escadas não foram girados ou espelhados.
- Encontros legados de Bia/Davi continuam retomáveis por seus registros existentes; impedir uma segunda oferta de início da aventura com o mesmo ID. Conclusões legadas não são apagadas nem premiadas novamente ao relembrar.
- Remover a apresentação dos objetos narrativos interiores no campus, mantendo uma única colocação interativa no São Jorge. Jardim, cantina, bilhete e atividades externas permanecem externos. A fotografia do jardim fica no jardim. Símbolos do Arquivo Aurora têm uma única instância por ID e aparecem na escola.
- A quadra é adaptação às dimensões existentes, não uma quadra regulamentar. Rede de vôlei recolhida por padrão; passagens laterais continuam livres quando montada. O mesmo objeto de bola é reutilizado, com uma simulação leve; sem sistema físico externo, missão obrigatória ou recompensa nova.

## Bugs e evidências

| Relato | Causa/evidência | Alteração | Validação |
|---|---|---|---|
| Pausas periódicas | A* bloqueava a thread principal, até 1,55 s no cenário inicial | Worker único + seleção local de AABBs | Rotas síncronas/assíncronas equivalentes; [Comparação de 60 s concluída](AURORA-093-PERFORMANCE.md) |
| Autosave/JSON | Nas janelas iniciais não explicaram os picos de centenas de ms; houve escrita isolada de 31,9 ms | Autosave preservado | Instrumentação registra save, JSON e Storage |
| Diálogo grande | Padding/margens e tipografia acumulados de estilos antigos | Caixa inferior compacta, ações agrupadas, conteúdo longo rolável, botões 44 px | Android paisagem passou; captura real |
| Câmera próxima | Distância curta e ângulo elevado limitado pelo teto | Distância exterior 8/interior até 5,4, limite físico do teto e aproximação por colisão | Testes de zoom, restauração e colisão passaram |
| Lorenzo de costas | Heading pretendido anterior à troca de referencial; deslizamento não considerado | Heading obtido do deslocamento real e expresso no frame após o portal | Caminhada entra/sai e testes angulares passaram |
| Personagens duplicados | Não reproduzido como segunda instância lógica/visual na auditoria | Manter os sete atores existentes; diagnóstico de UUIDs | Sete roots, mesmos UUIDs nas travessias |
| Missões repetidas | Props restaurados ao campus e oferta paralela evento/aventura | Suprimir pontos internos redundantes e resolver identidade legada sem apagar progresso | Identidade, quatro fluxos completos e recompensas validados |
| Fachada invertida | Acabamento na face mundial afastada do campus | Acabamento/letreiro na face da recepção | Teste de normal mundial e três acessos passou |
| Tabela encobrindo câmera | Geometria visual da tabela ausente da colisão da câmera | Volume de câmera separado da física de circulação | Captura real da quadra após correção |
| Piso esportivo cinza | Shader de pavimento externo aplicado ao material tile | Material azul próprio reutilizando pipeline Colorbeat | Captura real azul |

## Quadra

Piso azul, borda de segurança, linhas de futsal amarelas, basquete coral, vôlei laranja e centro branco. Traves com redes leves, tabelas, aros e redes; postes/rede móvel; travessas seguindo a cobertura curva existente, proteções de pilares e iluminação. Bancos, armário, bolas organizadas, cones, mochilas/garrafas e placar/relógio. Geometrias estáticas agrupadas por material, redes em LineSegments, materiais compartilhados, sombras extras desativadas, culling e colisores simples.

Interações: impulsionar a bola com E/toque; modo basquete lança em direção à cesta mais próxima; gol/cesta atualizam placar e confirmação sonora sintetizada, com reação de Caio. Placar alterna modalidade; rede monta/recolhe; armário examinável. Placar é de sessão e não concede progresso/recompensas narrativas. Caio usa uma rota pela quadra anexa com as portas e o coordenador existentes.

## Preservação e limites

Memórias, datas, textos históricos, quatro missões, inventário, conquistas e playlists não foram reescritos. A chave de Storage e seus domínios permanecem. As posições Y/XYZ da 0.9.2, escadas físicas e motor contínuo permanecem. Nenhum teste não executado deve ser considerado aprovado. Chromium com SwiftShader não representa desempenho do Galaxy S24 Ultra; a confirmação física do engasgo de 3–5 segundos continua pendente.

## Resultados finais

- **205 testes unitários passaram** na execução final.
- Navegador: lote de32 cenários teve31 aprovados e um teste legado esperando20 conquistas, embora a expansão anterior já totalize24. A expectativa foi atualizada para24, verificando também os nomes das quatro conquistas da expansão; o teste foi reexecutado e passou. Não se alterou o produto para satisfazer a contagem antiga.
- Mais quatro cenários: diálogo longo em retrato, três presets, Caio atravessando o portão da quadra e rede de vôlei por toque. Passaram. São **36 cenários distintos verificados ao longo das execuções**; a suíte de32 não foi repetida integralmente após os ajustes finais localizados.
- Seis memórias com descrição original, recompensa e reload; três minijogos; quatro missões completas com retomada, erros/dicas, cenas e recompensas; rádios, embaralhamento e minimização; NPCs, escadas e controles Android emulados foram exercitados.
- Presets Baixo/Médio/Alto foram testados em navegador com sombras desligadas para limitar custo do renderizador por software; configuração/reutilização de sombras tem cobertura unitária. Sombras e fluidez reais no aparelho ainda precisam de validação física.
- Perfil:12 janelas de pelo menos60s (seis antes/seis depois), incluindo rádio e adaptativo. Resultados completos em [desempenho](AURORA-093-PERFORMANCE.md), [CSV](performance/093/profile-summary.csv) e [JSON](performance/093/profile-summary.json). Tempos apresentados arredondados a0,01ms; contagens/picos não foram descartados.
- Build de produção aprovado, sem dependências novas. Worker minificado≈1,87kB; bundle principal≈502kB e Three.js≈573kB geram aviso de tamanho. Não foi feita uma refatoração global de bundles.
- Revisão independente identificou um marcador genérico que poderia substituir um objetivo de expansão no jardim por uma memória da campanha. Agora só objetivos interiores identificados por ID são remapeados; objetivos externos e NPCs são preservados. Há regressões unitárias específicas, inclusive para save legado com somente a fotografia do jardim pendente.

## Capturas reais

Em `docs/captures/093/`: `court-before.png` / `court-after.png` usam a mesma câmera da medição; `court-player.png` mostra interação normal; `court-roof-exterior.png` confirma a cobertura curva e o fechamento superior solicitado depois. `dialogue-before.png` / `dialogue-landscape.png` comparam o diálogo; o caso comum ficou abaixo de33% da altura da tela em paisagem, próximo à meta preferencial de30%, com todos os botões de44px. Textos longos têm rolagem.

`facade-before.png` / `facade-after.png` usam o modo de revisão arquitetônica já existente, que oculta a superfície da cobertura para a vista de entrada. Essa ocultação é somente do modo de revisão: a captura `court-roof-exterior.png`, no modo normal, mostra o telhado preservado. As imagens são renderizações reais do jogo, sem geração artificial.

`plan-complete.png`, `letter-complete.png`, `frequency-complete.png`, `archive-complete.png` e as capturas `regression-*` registram os fluxos e o mundo contínuo. As capturas originais das versões anteriores foram preservadas.

## Testar no Android

Na pasta real do repositório: `git fetch origin`, `git switch fix/aurora-093-polish-performance`, `npm ci`, `npm run dev -- --host 0.0.0.0`. Abrir no Chrome do Android `http://IP-DO-COMPUTADOR:5173`, na mesma rede. Esse teste local não publica o jogo nem instala automaticamente uma PWA.

Verificar60s por cenário (campus, quadra, escola e escadas), rádios ligado/desligado, presets, autosave, orientação de Lorenzo, diálogos, Caio/portões, gol/cesta e rede recolhível. Para diagnóstico adicionar `?profile`; via DevTools remoto, `window.auroraPerformance.snapshot()` fornece os tempos. O perfil não é ativado no jogo normal. O script `scripts/profile-aurora093.mjs` reproduz as janelas de laboratório sobre um build servido localmente.

**Pendente:** repetir no Galaxy S24 Ultra e em aparelho mais simples; confirmar a frequência original de3–5s. O renderizador SwiftShader continua apresentando picos e não demonstra FPS físico. Placar esportivo é de sessão; não é uma nova missão nem altera conquistas. Sem merge e sem deploy automático.

## Arquivos alterados

- `docs/AURORA-093-PERFORMANCE.md`
- `docs/AURORA-093-PLAN.md`
- `docs/AURORA-093-REPORT.md`
- `docs/captures/093/archive-complete.png`
- `docs/captures/093/court-after.png`
- `docs/captures/093/court-before.png`
- `docs/captures/093/court-player.png`
- `docs/captures/093/court-roof-exterior.png`
- `docs/captures/093/dialogue-before.png`
- `docs/captures/093/dialogue-landscape.png`
- `docs/captures/093/facade-after.png`
- `docs/captures/093/facade-before.png`
- `docs/captures/093/frequency-complete.png`
- `docs/captures/093/letter-complete.png`
- `docs/captures/093/plan-complete.png`
- `docs/captures/093/regression-android-physical-entrance.png`
- `docs/captures/093/regression-historical-album-preserved.png`
- `docs/captures/093/regression-npc-ascending.png`
- `docs/captures/093/regression-npc-descending.png`
- `docs/captures/093/regression-third-floor-stair-room.png`
- `docs/captures/093/school-after.png`
- `docs/captures/093/school-before.png`
- `docs/captures/093/stairs-after.png`
- `docs/captures/093/stairs-before.png`
- `docs/performance/093/preset-metrics.json`
- `docs/performance/093/profile-summary.csv`
- `docs/performance/093/profile-summary.json`
- `index.html`
- `package-lock.json`
- `package.json`
- `scripts/profile-aurora093.mjs`
- `src/main.js`
- `src/polish093.css`
- `src/systems/adventure.js`
- `src/systems/atmosphere.js`
- `src/systems/camera.js`
- `src/systems/campus-world.js`
- `src/systems/continuous-actors.js`
- `src/systems/continuous-school.js`
- `src/systems/dialogue.js`
- `src/systems/living.js`
- `src/systems/narrative-expansion.js`
- `src/systems/narrative-identity.js`
- `src/systems/navigation.js`
- `src/systems/objective-placement.js`
- `src/systems/pathfinding-worker.js`
- `src/systems/performance-probe.js`
- `src/systems/physics.js`
- `src/systems/quality.js`
- `src/systems/school-exterior.js`
- `src/systems/school-narrative.js`
- `src/systems/shared-pathfinder.js`
- `src/systems/spatial-routing.js`
- `src/systems/sports-court.js`
- `src/systems/story.js`
- `tests/polish093-extra.spec.js`
- `tests/polish093.spec.js`
- `tests/story.spec.js`
- `tests/unit/comic.test.js`
- `tests/unit/entrance-camera092.test.js`
- `tests/unit/locomotion093.test.js`
- `tests/unit/narrative-identity093.test.js`
- `tests/unit/objective-placement093.test.js`
- `tests/unit/performance-probe093.test.js`
- `tests/unit/quality.test.js`
- `tests/unit/school-exterior.test.js`
- `tests/unit/spatial-routing092.test.js`
- `tests/unit/sports-court093.test.js`
