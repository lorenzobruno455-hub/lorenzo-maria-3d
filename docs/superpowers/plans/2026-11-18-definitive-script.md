# Roteiro definitivo V1 — plano de integração

**Fonte:** PROJECT_AURORA_ROTEIRO_DEFINITIVO_V1.pdf, 33 páginas, autorizado pelo usuário em 18/11/2026.
**Base:** 186b72e, feat/aurora-093-perimeter-landscape. Branch: feat/aurora-definitive-script-v1.
**Arquitetura:** dados de cenas sequenciais + adaptador para Dialogue, CutsceneManager, Story, Adventure e NarrativeExpansion. Sem motor novo de puzzles, sem alterações geométricas. IDs e etapas legados permanecem.

- [x] 1. Nomes de apresentação dos cinco NPCs, proveniência e corpus integral de cenas/livros/conversas. Testar IDs e fonte dos textos.
- [x] 2. Estado aditivo validado de roteiro; sequências físicas dos seis capítulos, escolhas e retomada/replay; memória só após sequência. Testar save legado, interromper, pular e recompensa única.
- [x] 3. Conectar falas das sete aventuras aos respectivos objetivos existentes, sem modificar puzzles. Epílogo depois do Arquivo, revisível. Testar progressão e integração.
- [x] 4. Testes automatizados, navegador Android emulado, capturas, build e relatório. Não publicar nem integrar main.

## Pontos de revisão
- Save concluído antigo mantém memórias e recompensas e pode rever novas cenas.
- Fechar diálogo/cena restaura controles e permite retomar sem avançar objetivos indevidamente.
- Datas/títulos históricos e IDs não mudam; lacunas continuam identificadas.
- Falas de cenas não entram no pool aleatório; todos os interlocutores têm ID.
- Cenas não reposicionam NPCs/jogador nem introduzem render loops ou listeners duplicados.

## Decisões
O pedido dispensa aprovação intermediária. Usar pontos físicos já existentes e marcadores do sistema de interações, sem reconstruir cenário ou criar novas mecânicas. O prólogo legado de coleta permanece; o prólogo do álbum é complementar. Cartas íntimas não serão inseridas. Salvar apenas campos aditivos de roteiro, sob a mesma chave de save.

## Registro de validação
- Corpus: 47 cenas, 432 falas de cena, 19 conversas livres, seis livros. Extração revisada por IDs, mantendo repetições e interlocutores.
- Primeiro ciclo: 213 testes unitários aprovados; build aprovado. Navegador exigiu instalação do Chromium do Playwright.
- Revisão independente: corrigidos dois achados de progressão (conversas de Maria antes da fase; expansão herdada ao iniciar nova campanha), com testes RED→GREEN.
- Auditoria do registro de interações confirmou uso de obstáculos mundiais enquanto jogador/alvos estavam no referencial local da escola. Adaptador agora seleciona os obstáculos locais existentes; teste garante que paredes reais continuam bloqueando e que o campus mantém seus obstáculos.

- Final: 223 testes unitários; 19 cenários distintos de navegador (20 execuções aprovadas); build aprovado. Revisão independente concluída; achados de progressão corrigidos. Nenhum deploy/merge.
