# Auditoria inicial — 0.4

Base remota: main `40cb0e43ec7ba04e31269a485bf4151025d8f5e1`, versão 0.3.0. Checkout local sem alterações. Arquivo Color em reference/color-source.txt lido integralmente e confrontado pelos testes de integridade.

Antes de programar: `npm run test:unit` aprovou 17 testes; `npm test` aprovou 21 cenários Chromium, incluindo multitouch, orientação, câmera, prólogo, seis memórias, três minijogos e migração. Não são testes em aparelhos físicos.

O código já tem mundo e recursos agrupados, humanoides articulados, GLB sob demanda, colisão, câmera orbital, portas, capítulo/álbum, diálogos tipográficos com escolhas, áudio sintetizado e salvamento v03 com fallback v02. Memórias e texto original estão nos JSONs; não precisam ser reimportados ou reescritos.

Limitações confirmadas: Maria fica em (5,5); interlocutores e objetivos usam essa coordenada fixa. Não existem outros NPCs, navegação, rotina, reputação, acontecimentos secundários completos, histórico de diálogos ou modo livre separado. Os três minijogos começam imediatamente, sem etapa de instruções própria. O cenário tem duas alas, jardim e pavilhão musical, mas não cantina ou quadra. HUD ocupa muito espaço; faltam ajustes de tamanho/opacidade e volumes separados.

Estratégia: preservar módulos funcionais e acrescentar dados de NPCs/eventos, navegação em pontos conectados, estados de rotina, progresso social e um módulo de integração da escola viva. Remover coordenadas fixas da Maria nos alvos. Manter Maria disponível quando uma missão exige conversa e permitir rotina fora desses momentos. Conservar as seis memórias históricas, sem vincular reputação ao casal. Reutilizar a malha articulada, com cache de geometrias entre NPCs e culling por qualidade.

Incrementos: (1) estados persistentes, navegação, eventos e testes de lógica; (2) cenário, atores e integração; (3) interfaces, áudio/controles, regressão, polimento e entrega. Escadas/segundo andar só entram se houver suporte vertical estável; o motor atual é plano 2D para colisão horizontal.
