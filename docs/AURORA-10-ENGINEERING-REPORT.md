# Aurora 1.0 — engenharia e estabilidade

## Base e escopo

Branch `perf/aurora-10-engineering-stability`, baseada em `53dc1c9fb2ece1697f3f4b5aaa7f698044c81fd8`, head verificado do PR #23 / `feat/aurora-definitive-script-v1`. A main não foi utilizada como base. O diretório estava limpo antes do trabalho. Não houve merge, deploy ou publicação.

Mantidos mundo contínuo, escadas na sala de escadas, paisagismo, quadra coberta, sete personagens, rádios e músicas. Nenhum arquivo de `src/data` foi alterado: 47 cenas, seis capítulos/livros, sete aventuras, diálogos contextuais, epílogo, nomes exibidos e datas/títulos canônicos permanecem os mesmos. IDs e chave de armazenamento `lorenzo-maria-v04` preservados.

## Falhas reproduzidas e correções

| Falha / custo | Evidência | Correção localizada |
| --- | --- | --- |
| Fechar o jogo após o último marcador podia deixar uma cena sem objetivos | Snapshot persistido entre coleta final e avanço; teste recupera esse save legado | Persistir a coleta final junto com o avanço e reconciliar marcadores legados na inicialização |
| Capítulo concluído podia ficar sem sua memória/recompensa após interrupção | Snapshot salvo antes da recompensa canônica | Aplicar recompensa antes da primeira escrita de conclusão; reparar capítulos legados completos de forma idempotente |
| Worker indisponível, bloqueado por CSP ou com erro podia interromper a circulação dos NPCs | Constructor que lança, erro com rota pendente e bloqueio real da requisição no Chromium | Mesmo A* com fallback cooperativo, fatias de ~4 ms, watchdog e descarte de solicitações ao encerrar; sem teletransporte |
| Listeners e capturas de toque sobreviviam ao encerramento da instância | Eventos disparados após dispose; captura ativa durante blur/resize | Remoção dos handlers pertencentes à instância e liberação de capturas; preservados joystick, câmera e teclado |
| Preferências podiam acumular listeners / navegação ao reinstalar | Instalação e descarte repetidos | Dispose explícito das assinaturas e do elemento criado, integrado ao encerramento do jogo |
| Save de puzzle vazio ou corrompido podia validar indevidamente a ordenação | Permutações inválidas e recibos legítimos em testes | Validar IDs/permutação e preservar sequências legítimas e puzzles já concluídos |
| Reiniciar campanha podia bloquear aventuras ligadas a eventos escolares antigos | `living.events` continuava concluído após reset da aventura | Limpar somente os eventos vinculados às aventuras no reinício explícito; preservar amizades e outros dados |
| Listas de colisão da escola eram reconstruídas durante cada consulta | Até 1.855 consultas de corpo numa janela de 60 s, com concatenação/filtragem repetida | Cache da topologia estática por pavimento, invalidação ao carregar/geometria mudar, portas recalculadas e listas temporárias reutilizadas |

Não houve reconstrução de sistemas ou alteração de mecânicas dos puzzles. Geometria, materiais, qualidade visual e layout foram preservados. Não se introduziu dependência.

## Medição comparável

Linux, Node 24.22.1, Chromium headless/ANGLE/SwiftShader. Viewport 915×412 CSS px, DPR 0,5, buffer 457×206, preset Baixo, sombras e resolução adaptativa desligadas **nas duas versões**. NPCs ativos; rádio reproduzindo na amostra da quadra. Builds de produção congelados: base `53dc1c9` com os mesmos rótulos opt-in e candidato `61cc3fc`. Correções posteriores de reinício explícito e identificação da versão não são executadas nesses cenários.

Cada janela tem pelo menos 60 segundos após carregamento dos personagens/aquecimento. Câmera e posição são iguais em cada par. O script registra CPU, long tasks, escrita/serialização, navegação, colisões, HUD, áudio e recursos; amostragem de CPU nos últimos dez segundos. Instrumentação somente com `?profile`; render mede submissão CPU, não tempo GPU. JSON/CSV contêm percentis, picos >33,3/50 ms, máximos, eventos, heap e recursos.

| Cenário | Atualização P50 antes → depois (ms) | P95 | P99 | Consulta de colisores: média antes → depois (ms) | Draw calls / triângulos (iguais no par) |
| --- | --- | --- | --- | --- | --- |
| Campus | 1,3 → 1,5 | 5,6 → 6,3 | 10,0 → 22,7 | não aplicável | 198 / 213.016 |
| Escola | 3,2 → 2,4 | 24,9 → 7,5 | 40,8 → 37,3 | 0,0898 → 0,0188 | 177 / 204.248 |
| Patamar da escada | 2,8 → 3,0 | 10,2 → 27,7 | 40,0 → 40,5 | 0,0588 → 0,0175 | 126 / 193.300 |
| Quadra + rádio | 2,4 → 2,4 | 9,6 → 9,8 | 39,3 → 37,6 | não aplicável | 232 / 248.896 |
| Diálogo | 3,5 → 2,5 | 14,0 → 8,2 | 39,9 → 35,4 | 0,0505 → 0,0134 | 162 / 203.008 |
| Puzzle | 1,3 → 1,1 | 2,4 → 2,1 | 5,0 → 4,2 | 0,0389 → 0,0177 | 87 / 110.442 |
| Meio da escada — par adicional | 3,4 → 2,3 | 11,7 → 7,1 | 44,4 → 39,3 | 0,0846 → 0,0155 | 158 / 263.262 |

O custo da lista de colisores na escola caiu aproximadamente 79%; a lista estática foi reconstruída apenas três vezes na amostra candidata. Portas móveis continuam atualizadas. Draw calls, triângulos, geometrias e texturas terminaram iguais em todos os sete pares.

**Não há melhora global uniforme comprovada.** O P95 do patamar e o P99 do campus pioraram na primeira amostra; por isso foi registrado um par adicional no meio da escada, sem apagar os resultados desfavoráveis. A posição antiga da amostra `stairs` é resolvida no patamar inferior; `stairs-midflight` usa altura válida no lance. O ambiente por software apresenta frames de centenas de milissegundos fora do custo CPU medido do update. Isso impede atribuir todos os picos ao jogo ou declarar eliminados os engasgos de 3–5 s relatados em aparelhos físicos.

Autosave, JSON e localStorage foram medidos, sem demonstrar uma causa periódica única: máximo de save observado 21,1 ms na amostra candidata do campus; nas demais janelas com save, até 4,4 ms. O salvamento automático foi mantido. Long tasks não provam GC; amostras de GC em CPU não demonstram relação causal com os engasgos. Não se reduziram visuais para obter números artificiais.

Dados: [JSON](AURORA-10-METRICS.json), [CSV](AURORA-10-METRICS.csv). Reproduzir com dois builds servidos em portas diferentes e `node scripts/profile-aurora10.mjs before PORTA`, depois `after PORTA`. O quarto argumento filtra um cenário; arquivos existentes são preservados, portanto usar nomes de execução novos para repetir. Saídas brutas em `work/aurora10/`, não versionadas.

## Validação

`npm run test:unit`: **237/237 aprovados**, nenhum cancelado/ignorado. `npm run build`: aprovado, 127 módulos transformados. **44/44 cenários da regressão aprovados em execuções segmentadas**, mais **8/8 cenários de engenharia** (52 casos distintos). Incluem seis capítulos, sete aventuras, quatro missões da expansão, escadas físicas, NPCs, portões, três presets, rádios, multitouch, reinício e retomada. A execução inicial do navegador foi encerrada externamente após 21 aprovações; somente casos restantes foram retomados. O teste de presets apresentou uma falha intermitente de visibilidade da rádio e passou na repetição isolada; essa ocorrência permanece registrada, sem correção presumida. Logs em `work/aurora10/{regression,regression-rest,regression-last,preset-retry}.log`. Nos três ciclos de entrada/saída: 228 geometrias, 24 texturas, 228 draw calls e 304.264 triângulos, sem crescimento observado. Capturas atuais em [captures/aurora10](captures/aurora10), incluindo capítulos, puzzles, escadas e comparações antes/depois. Os testes de narrativa usam saves em pontos de cada interação para cobrir o roteiro; os testes físicos separados exercitam deslocamento contínuo, portas e escadas. Nenhum deslocamento de fixture é uma mecânica inserida no jogo.

Uma revisão técnica independente das alterações de produção não encontrou falhas de severidade Critical/Important. A revisão não substitui os testes nem a validação física Android.

## Sistemas preservados e áreas auditadas

- Renderização/loop: instrumentação por subsistema no loop existente; sem novo render loop. Mesmo renderer, luzes, sombras, presets, assets e carregamento de pavimentos. Não foram encontrados motivos comprovados para recriar materiais/geometrias ou introduzir pooling global.
- Mundo: consultas de colisão estáticas/dinâmicas, motor vertical, portões, escadas, câmera e grafo espacial. Fallback de navegação reutiliza a mesma busca e conserva os caminhos; não reposiciona NPCs.
- Narrativa: corpus com 47 cenas, 19 conversas e seis livros; seis capítulos e sete aventuras integrados aos mesmos sistemas `Adventure`, `Story`, `DefinitiveScript`, expansão e cenas. Correções restritas à persistência/retomada/reset, não aos textos ou à estrutura narrativa.
- Persistência: mesmo validador, armazenamento e recibos de recompensa; recuperação de estados intermediários de versões anteriores sem limpar progresso. Somente o comando explícito de nova campanha redefine os eventos correspondentes.
- Android: controles Pointer Events, teclado, captura de ponteiros, multitouch, blur/visibility/resize e retorno de menus. Sem redesign de layout.
- Recursos: descarte idempotente de controles/preferências/main, cancelamento de caminhos pendentes e preservação do gerenciamento WebGL existente. Contadores de GPU comparados em ciclos de navegação; isso não constitui prova de ausência de qualquer vazamento de longa duração.

Arquivos de produção modificados: `src/main.js`, `src/systems/{adventure,continuous-actors,continuous-school,controls,definitive-script,navigation,physics,preferences,script-progress,shared-pathfinder}.js`; identificação da versão em `index.html`, `package.json` e lockfile. Testes novos em `tests/unit/{stability10,controls10,pathfinder10}.test.js` e `tests/engineering10.spec.js`; adaptações de fixtures físicas conservam as asserções. Script de perfil e configuração Playwright ficam separados do código de jogo.

Build aprovado com o aviso já existente de chunk acima de 500 kB. Não se alterou a estratégia de empacotamento sem profiling que justificasse uma mudança maior.

## Limitações e validação física Android

Esta execução usa Chromium emulado, não um Galaxy S24 Ultra físico. Nenhum FPS de aparelho é inferido. Ainda é necessário:

- Medir 60 s no campus, quadra com rádio, escola e escadas nos três presets no aparelho, observando intervalos de 3–5 s.
- Testar joystick + câmera + correr simultaneamente, inverter/parar no meio da escada e entrar/sair pelos portões.
- Alternar entre apps, bloquear/desbloquear a tela e retornar; conferir ausência de movimento preso e retomada do áudio conforme a política do Android.
- Encerrar/reabrir durante missão/puzzle e no meio da escada; confirmar progresso e recompensas únicas.
- Ler diálogos longos, livros, álbum e epílogo em paisagem, verificando toque e legibilidade.

Para testar sem publicar: na pasta do clone, executar `git fetch origin`, `git switch perf/aurora-10-engineering-stability`, `npm ci` e `npm run dev -- --host 0.0.0.0 --port 5173`. No Chrome Android conectado à mesma rede, abrir a URL **Network** mostrada pelo Vite. O link público instalado anteriormente continua na versão publicada anterior. A validação de instalação/PWA e de políticas de áudio/fullscreen deve ser feita também no ambiente HTTPS quando houver autorização para publicação.

O site público permanece inalterado. A branch é para revisão; não houve merge ou deploy.
