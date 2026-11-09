# Missões 0.7B

`src/data/adventures.js` define três aventuras no cenário escolar existente. As encenações, opções de conversa e atividades são ficção escolar. A lembrança histórica `memory-1` mantém a data **19/08/2024** e o texto do autor, sem alterações: “Aula de história. Eu estava extremamente envergonhado, mas pedi para ficar com você.”

| Aventura | Eventos em ordem | Recompensa |
| --- | --- | --- |
| `first-encounter` | `scene:first-intro`, `visit:classroom`, `examine:study-notebook`, `examine:classroom-photo`, `talk:maria`, escolha, `activity:school-exercise`, `scene:first-finale` | `memoryId: memory-1` |
| `lost-book` | `talk:bia`, escolha, `examine:shelf-clue`, `activity:shelf-puzzle`, `pickup:lost-book`, `deliver:bia`, `scene:book-finale` | `friendId: bia`, `eventId: lost-book` |
| `familiar-music` | `talk:davi`, escolha, `pickup:score`, `examine:instrument`, `activity:music-rhythm`, `talk:davi`, `scene:music-finale` | `friendId: davi`, `eventId: familiar-music` |

As aventuras secundárias exigem a conclusão de `first-encounter`; depois podem ser feitas em qualquer ordem. Apenas uma aventura pode estar ativa. Cada passo tem título de objetivo, posição e rótulo do alvo para a integração física. Escolhas são nós explícitos `type: 'choice'`, com `choices: [{id,label}]`; ambas as opções continuam a aventura. Elas ficam registradas no save e não alteram a lembrança histórica.

## Contrato

`new QuestDirector({getState,save,onReward,onChange,definitions=ADVENTURES})` lê o objeto `progress.adventure`, sem acessar DOM, mundo ou armazenamento diretamente. `save(snapshot)` deve armazenar esse objeto no progresso existente. O diretor não substitui campanha, amizades ou progresso legado.

- `start(id)` retorna `true` apenas ao iniciar uma aventura disponível com pré-requisitos cumpridos.
- `emit(type,target,payload={})` aceita somente o passo atual. Atividades exigem `payload.completed === true`; abrir o painel ou um resultado incompleto não avança. Um `payload.receipt` opcional é uma string única por aventura; sua reutilização rejeita o evento.
- `choose(id)` aceita apenas uma opção do nó atual de escolha.
- `current(id?)` retorna um retrato independente com `id`, `questId`, `title`, `status`, `node`, `step`, `awaitingChoice`, `choices`, `receipts`, `rewarded` e `definition`. Sem id, consulta apenas a aventura ativa e retorna `null` após o final. Com id, também consulta aventuras disponíveis ou concluídas.
- `snapshot()` retorna apenas estado serializável independente.
- `freshAdventure()` cria o estado inicial e `validateAdventure(raw)` sanitiza saves. Ambos aceitam definições opcionais para testes e integrações.

Formato: `{version:1, active:null|string, quests:{[id]:{status:'available'|'active'|'completed',node,choices,receipts,rewarded}}}`. `node` é o índice do próximo passo; no final é igual ao tamanho da sequência. Eventos não são enfileirados: uma interação antecipada deve ser repetida no passo correto.

A validação elimina ids desconhecidos, nós fora dos limites, opções inválidas, estados incompatíveis, pré-requisitos não satisfeitos e aventuras ativas simultâneas. Um save legado sem `adventure` recebe somente o estado novo inicial; a integração preserva os outros campos do save.

No final, o estado terminal e a marca `rewarded` são persistidos antes de `onReward({questId,reward,choices})`. Repetir eventos, reiniciar ou recarregar não chama novamente a recompensa. O callback deve aplicar desbloqueios idempotentes à campanha existente. A persistência local e o callback não são uma transação entre sistemas: uma interrupção no intervalo entre ambos exige que a integração reconcilie desbloqueios pelo estado concluído, sem repetir efeitos não idempotentes.

## Verificação

`node --test tests/unit/quest07b.test.js` cobre as três sequências completas com reload após cada nó, pré-requisitos, escolhas, atividades incompletas/alvos errados, eventos antecipados, recibos duplicados, final idempotente, snapshots independentes, saves inválidos e preservação da lembrança original.

## Integração jogável

O journal fica no menu inicial e em Álbum e história → Aventuras 0.7B. Primeiro Encontro requer o prólogo concluído. Alvos físicos são resolvidos em `Adventure.target()` a partir dos objetos existentes e das posições atuais dos NPCs, não das coordenadas ilustrativas do catálogo. O `InteractionRegistry` mantém distância e oclusão, com prioridade da etapa ativa. O caderno abre a capa em 3D e a coleta tem trajetória até a mão. Pausar/fechar uma atividade conserva o objetivo, mas reinicia a tentativa ao reabri-la.

A recompensa terminal é reconciliada em carregamentos posteriores: desbloqueio da memória/vale, conclusão do encontro e amizade usam guardas ou recibos estáveis. A conclusão rápida antiga não torna o objeto invisível na nova aventura. Escolhas fechadas sem confirmação podem ser retomadas pelo NPC próximo ou pelo journal. O minijogo de música suspenso não recebe tempo nem acertos invisíveis.
