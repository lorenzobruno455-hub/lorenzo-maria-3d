# Aurora 1.2.1 — NPCs, encenação e carga mobile

Branch: `fix/aurora-121-living-cinematics-performance`, baseada na 1.2 validada (`0d2acb6`, PR #27). Commit de código: `3af7b797875a86b70e14fe6ee76ac0dd3f41c851`.

## Correções localizadas

- Rotinas reaproveitam os seis trajetos diferentes, A* compartilhado, portas, escadas e colisões existentes. A chegada reconhece o ponto realmente alcançável devolvido pela navegação, evitando espera permanente diante de um destino ajustado. Dois planos vazios ou bloqueios persistentes fazem tentar o próximo ponto, sem reposicionar artificialmente o NPC.
- Personagens necessários à missão aguardam quando o jogador está próximo, em vez de ficarem congelados durante toda a missão. Pausas de rotina usam observação, gestos e conversa quando há outro personagem próximo. Identidade e estado persistente são mantidos.
- NPCs a mais de 30 unidades atualizam decisões/movimento a cada 0,25 s; trechos de escada mantêm a cadência normal. A animação de personagens ocultos por distância/pavimento deixa de ser atualizada.
- O sistema anterior impedia aplicar posições cinematográficas e filtrava atores distantes. A direção existente agora admite os interlocutores necessários, escolhe pontos livres próximos, resolve coordenadas locais/mundiais e força a visibilidade durante a cena. As seis cenas principais mantêm sua direção; outras cenas com atores reutilizam o mesmo motor e seu título original.
- Rotinas permanecem suspensas durante a cutscene. Posição, orientação, visibilidade e poses são restauradas ao encerrar, interromper ou pular. A encenação temporária não sobrescreve as coordenadas persistentes das rotinas.
- Corrigida a ordem de fechamento do álbum antes de restaurar uma revisita escolar: o painel aberto bloqueava a restauração da escola.

## Mobile

Um limitador atua no RAF já existente, antes das atualizações e do desenho: máximo de 60 FPS em dispositivos mobile/touch, com opção persistente de 30 em Configurações. Não há loop adicional nem simulação de quadros para compensar atrasos. O FPS efetivo pode ser inferior ao limite.

| Configuração mobile | Baixo | Médio | Alto |
|---|---:|---:|---:|
| Teto de pixel ratio, 60 FPS | 1 | 1,2 | 1,5 |
| Teto de pixel ratio, 30 FPS | 0,85 | 1 | 1,2 |
| Mapa de sombra, 60 FPS | Desativado | 1024 | 1024 |
| Mapa de sombra, 30 FPS | Desativado | 512 | 512 |

A resolução adaptativa reconhece o limite de 30 FPS e não reduz qualidade por confundi-lo com lentidão. As alocações de buffer/sombras continuam protegidas contra mudanças redundantes. Desktop com ponteiro fino mantém seus presets anteriores. Cores, materiais, contornos e conteúdo Colorbeat foram preservados.

A suspensão existente por `visibilitychange` cancela o RAF, salva e limpa controles; a retomada reinicia o relógio do limitador. Não se altera o comportamento autorizado do rádio. Não houve medição de temperatura, consumo ou FPS em Android físico; a redução de carga não é uma promessa de eliminar aquecimento.

## Validação

Ambiente: Node 24.22.1, Chromium headless/SwiftShader, viewport touch 915×412, DPR 0,5. Software rendering não representa Galaxy S24 Ultra.

- `npm run test:unit`: **276 aprovados**.
- `npm run build`: aprovado; permanece o aviso anterior de tamanho de chunks.
- **10 fluxos únicos de navegador aprovados:** seis NPCs caminhando com UUIDs preservados; Maria distante presente na cena com pausa/pulo e save espacial preservado; preferência 30 FPS persistente e suspensão em segundo plano; seis cenas principais com pausa/interrupção/pulo/recarga; conclusão natural da aceitação com controles restaurados.
- Testes unitários novos cobrem 60/30 em uma sequência de RAF de 120 Hz, restauração de atores em grupo rotacionado, escolhas de posições sem obstáculos/sobreposição, recuperação de rotas e adaptação gráfica em 30 FPS.

Os testes cinematográficos antigos antecediam a campanha sequencial da 1.15: usavam CONTINUAR para entrar em replay, o que corretamente encerra a revisão. A preparação passou a usar Álbum → Revisitar, mantendo as verificações originais. Tentativas com preparação inválida e uma execução afetada pelo encerramento do servidor foram interrompidas; não são apresentadas como aprovadas. Um Vite dedicado sustentou a execução final. Os casos já aprovados de NPCs/FPS não foram repetidos na regressão das cenas.

Comandos relevantes:

```sh
npm run test:unit
npm run build
npx playwright test tests/aurora121.spec.js --workers=1
npx playwright test tests/cinematic11.spec.js --workers=1
```

## Preservação e revisão

Sem dependências, novos personagens, missões, diálogos ou alterações nos arquivos de dados narrativos. Saves mantêm a chave/formato anterior; `mobileFPS` é uma preferência opcional, com padrão 60 para saves antigos. Rotinas e controle cinematográfico reaproveitam os mesmos módulos e instâncias.

Arquivos principais: `continuous-actors.js`, `cutscene-manager.js`, `cinematic-direction.js`, `definitive-script.js`, `journey.js`, `quality.js`, novo `frame-limiter.js`, integração em `main.js`, preferência em `progress.js`/`preferences.js` e campo em `index.html`. Testes em `aurora121.spec.js`, `cinematic11.spec.js`, `cinematic-review-helpers.js` e `unit/aurora121.test.js`. Versão do pacote atualizada para 1.2.1.

[Movimentação](captures/aurora121/npcs-active.png) · [Maria trazida à cena](captures/aurora121/cast-staged.png) · [Aceitação](captures/aurora121/acceptance.png). Capturas das cenas A–F na mesma pasta.

Publicação autorizada no pedido, no endereço existente, sem merge na main do GitHub. No Android físico, conferir: trajetos e portas, escadas, conversas/objetivos, presença nas cenas, pular/retomar, alternar 60/30, minimizar e reabrir, qualidade visual e temperatura após 10–15 minutos. Validação física permanece pendente.
