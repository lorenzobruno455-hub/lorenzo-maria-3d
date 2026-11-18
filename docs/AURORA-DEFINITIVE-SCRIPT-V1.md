# Project Aurora — roteiro definitivo V1

## Base e escopo

Base GitHub: `186b72e` (0.9.3 com paisagismo). Branch `feat/aurora-definitive-script-v1`. Fonte: PDF de 33 páginas enviado pelo proprietário em 18/11/2026. Integração autorizada integralmente, sem aprovação intermediária. Nenhum deploy ou merge.

## Conteúdo integrado

- 47 cenas: prólogo do álbum, 29 cenas dos seis capítulos, 15 cenas das sete aventuras e duas do epílogo.
- 432 falas de cena e 70 falas em 19 conversas contextuais. Interlocutores e ordem preservados; repetições do documento mantidas no corpus.
- Seis livros com os textos documentais/reflexivos do PDF, vinculados aos `memory-1` a `memory-6` existentes.
- Nomes exibidos: `bia` → Rafaella, `caio` → Porva, `helena` → Prof Newmara, `davi` → Bassarab, `lia` → Helô. IDs, modelos, rotas, amizades e chaves de save permanecem.
- Capítulo 1: fotografia de 2023, Chromebook original leve, estudo, celular recriado, recusa, silêncio, retomada, percurso das aulas, uma encenação do “Pode ser”, dia seguinte, cotidiano e retorno ao álbum.
- Capítulos 2–6: percurso documental/simbólico com marcadores, reflexão, atividade musical existente, fitas e revisão dos pontos de memória. Lacunas históricas continuam explicitamente pendentes.
- Aventuras `first-encounter`, `lost-book`, `familiar-music`, `plan`, `letter`, `frequency`, `archive`: falas sequenciais nos objetivos existentes, mantendo IDs, puzzles, passos, inventário e recompensas.
- O Arquivo concluído encaminha ao epílogo; saves antigos com Arquivo concluído também podem acessá-lo pelo menu. A escolha do título da página é persistente e não muda os fatos. O encerramento original/carta final permanece disponível.

## Reutilização e compatibilidade

`Dialogue` mantém leitura, escolhas, fechar e controles; `CutsceneManager` mantém câmera, pausa, pulo e restauração. Cenas longas aguardam o leitor, sem cortar falas pelo timeout legado. `Story`, `Adventure`, `QuestDirector`, `NarrativeExpansion`, conquistas e salvamento permanecem responsáveis por seus sistemas. O adaptador não cria outro player, rádio, pathfinder, loop de renderização ou instância de NPC.

O campo aditivo `progress.script` guarda cena ativa, cenas concluídas, escolhas, marcadores e puzzle de reflexão. A chave `lorenzo-maria-v04` e a versão 4 continuam iguais. Saves sem o campo recebem estado vazio. Memórias concluídas e recompensas existentes são mantidas; revisitar cenas não concede recompensa novamente. Iniciar **explicitamente** uma nova campanha limpa também roteiro/expansão dessa campanha.

Nenhuma carta privada nova foi transcrita. As falas usam etiquetas de relato do autor, dramatização, ficção e contexto pendente. A frase recordada “Pode ser” é distinguida da pergunta aproximada e das demais falas recriadas.

## Correções identificadas na integração

| Problema | Correção |
| --- | --- |
| Conversas posteriores de Maria disponíveis cedo demais | Condições por cenas concluídas/memórias legadas |
| Nova campanha podia herdar Arquivo concluído/epílogo | Estado de expansão novo no reset explícito; epílogo exige seis memórias |
| Interações escolares comparavam coordenadas locais com obstáculos mundiais | Seleção dos obstáculos locais existentes enquanto estiver na escola |
| Alvo de leitura dentro da mesa | Uso do ponto de aproximação existente |
| Marcador de jardim sobre a mesa da fotografia antiga | Marcador movido para ponto livre próximo; móvel original preservado |
| Abertura dos livros precisava manter foco de câmera | Foco original restaurado ao ler os novos textos, com teste unitário e de navegador |
| Teste preparava posição antes do salvamento de saída | Fixture aplica posição após o evento de saída; salvamento real não foi alterado |

## Verificação

- `npm run test:unit`: 223 testes aprovados, incluindo os três fluxos do QuestDirector, quatro missões da expansão, saves, IDs e cutscenes.
- Navegador: 20 execuções aprovadas em três rodadas, correspondendo a 19 cenários distintos. Os seis capítulos foram concluídos; as quatro missões da expansão passaram do início à recompensa, com reabertura de puzzles e recarga de saves.
- Cobertura adicional: fechar/retomar diálogo, toque, teclado bloqueado durante diálogo, epílogo em save antigo, título persistente, integração da aventura inicial, alvos junto a móveis, câmera/animação dos livros, recompensas únicas, álbum, inventário e replay.
- Layouts de toque: 915×412, 390×844 e 640×360; isolamento de múltiplos toques e recursos estáveis em seis reaberturas. Nenhum erro de runtime nos fluxos que registram esses erros.
- `npm run build`: aprovado. Sem dependências novas.
- Comparação com a base: IDs canônicos, títulos/datas das memórias/capítulos e recompensas preservados. Arquivos de rádios, escadas físicas, navegação espacial, controles e física sem alterações.

Testes de navegador usam Chromium/SwiftShader com toque emulado; pontos de teste são preparados pelo save para validar interações e retomada. Isso não equivale a medir desempenho em aparelho físico nem a percorrer cada rota a pé.

## Limites e pendências

- Confirmar historicamente a separação em 2025, o evento de fé, o sentido de “primeiro beijo”, as flores e o pedido de 21/09/2026, como indicado no PDF. Nenhum detalhe foi preenchido como fato.
- A encenação usa câmera, poses e cenário existentes, sem reconstruir escola nem criar personagens adicionais para flashbacks. O acabamento cinematográfico deve ser avaliado visualmente pelo proprietário.
- Validar no Android físico: fluidez, legibilidade das conversas longas, multitouch, troca de orientação, música/rádios junto às cenas, áudio silencioso nos puzzles e retomada após o sistema encerrar o Chrome.
- O aviso de bundle Vite acima de 500 kB já existia; nenhuma dependência foi adicionada.
- A suíte completa de Playwright não foi repetida. As duas aventuras legadas de livro/ensaio foram cobertas pela lógica de progressão e mapeamento de cenas, sem repetir nesta execução seus percursos completos no navegador.
- O site publicado permanece na versão anterior. Esta branch não foi publicada.

## Como testar no Android

Dentro da cópia local do repositório, atualizar e selecionar `feat/aurora-definitive-script-v1`, executar `npm ci` e `npm run dev -- --host 0.0.0.0`. Abrir o endereço de rede exibido pelo Vite no Chrome do celular conectado à mesma rede. Não limpar os dados do jogo. Os saves de um endereço local e os do site publicado ficam separados pelo navegador; um teste local não apaga o save do site.

Usar Álbum e história → **Roteiro definitivo · capítulos e epílogo**. Saves antigos podem rever seus capítulos; saves novos mantêm o prólogo de coleta. O novo prólogo do álbum encaminha à aventura inicial. Seguir o HUD e caminhar pelos acessos/escadas existentes. Conferir o diálogo curto de 19/08, fechar e retomar uma conversa, concluir os puzzles sem áudio e rever o epílogo após o Arquivo.

## Capturas reais

As capturas novas estão em `docs/captures/definitive-script/`: cena “Pode ser”, diálogo Android com proveniência, seis capítulos concluídos, câmera do livro, puzzles e conclusões das missões. As capturas anteriores foram preservadas em seus diretórios originais.

## Arquivos alterados

- `docs/AURORA-DEFINITIVE-SCRIPT-V1.md`
- `docs/superpowers/plans/2026-11-18-definitive-script.md`
- `src/data/achievements.json`
- `src/data/adventures.js`
- `src/data/chapters.json`
- `src/data/definitive-script.json`
- `src/data/events.json`
- `src/data/expansion.js`
- `src/data/memories.json`
- `src/data/npcs.json`
- `src/data/script-staging.js`
- `src/main.js`
- `src/systems/adventure.js`
- `src/systems/campus-world.js`
- `src/systems/cutscene-manager.js`
- `src/systems/definitive-script.js`
- `src/systems/dialogue.js`
- `src/systems/events.js`
- `src/systems/living.js`
- `src/systems/narrative-expansion.js`
- `src/systems/narrative-identity.js`
- `src/systems/progress.js`
- `src/systems/school-narrative-map.js`
- `src/systems/script-progress.js`
- `src/systems/sports-court.js`
- `src/systems/story.js`
- `tests/definitive-script.spec.js`
- `tests/narrative-expansion.spec.js`
- `tests/unit/cutscene07b.test.js`
- `tests/unit/definitive-script.test.js`
