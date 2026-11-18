# Aurora 1.1 — direção cinematográfica

## Base e preservação
Base `e9bb1cf` (Aurora1.0, PR24), branch `feat/aurora-11-cinematic-performance`. Sem merge/deploy. Nenhuma alteração no corpus `src/data`, nos IDs, nas datas/títulos, na chave de save ou nas recompensas. Mantidos exploração, escadas, NPCs únicos, rádio e controles.

## Direção implementada
| Momento | Cenas | Encenação |
| --- | --- | --- |
| A — primeiro sorriso | CAP01-CENA02 | Estabelecimento do Chromebook, alternância por fala, reação de Maria quando presente e pausa final |
| B — julho2024 | CAP01-CENA05 | Painel de mensagens com texto canônico, leitura manual e aviso de reconstrução, sem novas mensagens literais |
| C — cinco aulas / sexta aula | CAP01-CENA08/09 | Objetivos físicos existentes, indicação das aulas/recreio, hesitação, plano de reação em “Pode ser.”, pausa e sinal escolar original no encerramento natural |
| D — flores | CAP05-CENA01 | Enquadramento do ponto do jardim, gestos contidos e pausa; mesmo contexto do arquivo |
| E — pedido | CAP06-CENA01/03 | Direção documental do álbum e do marco existente; nenhuma proposta ou resposta inventada para preencher lacunas |
| F — diário | EP-CENA01 | Plano do diário, seis títulos/datas canônicos com destaque progressivo, escolha original e continuidade do conteúdo |

Posições físicas são respeitadas. Somente atores visíveis a menos de6m e até1,5m de diferença de altura recebem direção; personagens distantes não são clonados ou teleportados. O plano se adapta ao objeto ou ao jogador quando o interlocutor não está próximo. A aproximação do jogador utiliza os objetivos e movimentos existentes. Não há entradas/saídas roteirizadas de atores distantes nesta entrega.

Comparações diretas: [A antes](captures/aurora11/A-before.png) / [A depois](captures/aurora11/A-after.png); [B antes](captures/aurora11/B-before.png) / [B depois](captures/aurora11/B-after.png); [C antes](captures/aurora11/C-before.png) / [C depois](captures/aurora11/C-after.png); [D antes](captures/aurora11/D-before.png) / [D depois](captures/aurora11/D-after.png); [E antes](captures/aurora11/E-before.png) / [E depois](captures/aurora11/E-after.png); [F antes](captures/aurora11/F-before.png) / [F depois](captures/aurora11/F-after.png).

## Sistemas e arquivos
- `CutsceneManager`: beats declarativos por índice de fala, câmera interpolada com colisões do mundo e do trajeto, pausa da leitura e encerramento distinto de interrupção. Restaura transforms, gestos, direção e ownership dos listeners em todos os caminhos.
- `Dialogue`: assinaturas temporárias por fala, bloqueio de avanço/revelação durante pausa. O mesmo texto e a mesma navegação de escolhas.
- `Character`: olhar aditivo limitado a ±0,55rad horizontal / ±0,25rad vertical no nó `head` dos rigs originais, sem trocar animações; sem processamento de gaze no idle antes de ativação.
- Novos `cinematic-direction.js` (configurações e enquadramentos) e `cinematic-presentation.js` (um overlay DOM por jogo, atualizado apenas por fala).
- `DefinitiveScript`: adaptador para os seis momentos prioritários, preservando progressão, escolhas e recompensas.
- `audio.js`: sinal escolar sintetizado original, respeitando áudio desbloqueado, mute e limites de nós existentes. Nenhum MP3 novo.
- `main.js`: visibilidade correta do protagonista em cutscenes e diagnóstico read-only de direção/plano.
- `adventure.css`: legendas, painel de mensagens e referências das seis memórias; rádio apenas oculto visualmente durante cenas, mantendo reprodução e estado.
- Identificação1.1 em HTML/package/lock. Nenhuma dependência adicionada, nenhuma câmera ou render loop novo.

## Evidências
Comparações reais em [captures/aurora11](captures/aurora11): A–F antes/depois e aceitação. Capturas anteriores feitas no código1.0 e posteriores com os mesmos saves/viewport. A demonstração adicional `C-nearby-cast.png` utiliza um save de teste com Maria já na sala; não é mecanismo de reposicionamento do jogo.

Ambiente: Linux, Node24, Chromium headless/ANGLE/SwiftShader, viewport915×412CSSpx, DPR0,5. Isso não mede FPS de Galaxy S24 Ultra. Colisões são testadas com parede/teto e inspecionadas nas capturas; não se afirma cobertura de toda posição de câmera possível.

## Validação
- Unitários finais: **244/244 aprovados**.
- Build de produção1.1: **aprovado**; aviso existente de chunks acima de500kB mantido.
- Seis casos cinematográficos A–F: aprovados em execuções segmentadas; pausa, bloqueio de movimento, interrupção sem concluir, pulo, escolhas e retomada após reload.
- Regressão final: **seis capítulos, cancelamento/retomada e epílogo aprovados**; preservadas as recompensas canônicas e o título escolhido.
- **15 casos distintos de navegador aprovados**, em execuções segmentadas: seis cenas A–F, conclusão natural com Maria já presente e oito cenários de regressão narrativa. Repetições pontuais de B/F verificaram os ajustes visuais finais. Falhas iniciais de preparação dos testes foram corrigidas: responder à escolha de julho e aguardar o alvo de interação; não exigiram alteração na progressão do jogo.
- `git diff e9bb1cf -- src/data public`: vazio; textos, assets e dados históricos preservados. `git diff --check`: aprovado.
- Logs locais: `work/aurora11/{baseline,browser-final,browser-rest,regression,regression-rest,unit-final,build-final}.log`.
- Revisão independente read-only: sem achados bloqueadores comprovados; testes de navegador continuaram como evidência necessária.

## Limitações e teste físico
Não houve teste em Android físico ou gravação de vídeo; foram registradas capturas reais. Não se afirmam ganhos de FPS ou ausência universal de clipping. NPCs fora da cena não são convocados: o enquadramento permanece local. O pedido de namoro permanece documental porque o roteiro contém detalhes pendentes, conforme restrição do autor.

No Android: testar modo paisagem, avançar/revelar/encerrar conversa, pausar/retomar/pular cada momento, alternar apps e reabrir durante uma cena, confirmar as escolhas e recompensas únicas. Conferir movimento/câmera após encerrar, livro/álbum após o epílogo e fluidez nos três presets. Recomenda-se polimento posterior de marcação física de atores próximos, mantendo navegação real, e validação de enquadramentos em múltiplos saves/dispositivos.
