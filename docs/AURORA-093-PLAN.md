# Aurora 0.9.3 — plano de implementação

Base limpa: 15bfaac, feat/aurora-092-continuous-world, PR #20. Sem merge/deploy. Execução direta em seis módulos conforme especificação do proprietário e preferência anterior por não interromper marcos para aprovação.

Arquitetura: manter Three.js/Vite, sistemas narrativos e motor espacial atuais. Correções locais; sem dependências novas. Perfil de desempenho opt-in por URL, sem painel/render loop extra. Não atribuir GC ou tempo GPU sem API/evidência. A quadra usa geometria procedural compartilhada/batching e a interação de bola já existente.

- [ ] M1: instrumentar frame/update/render, save/JSON/storage, NPC/A*, colisões, recursos, resolução, HUD e áudio; medir cenários de 60 s; corrigir somente custos demonstrados e comparar mesmo seed/câmera/preset/resolução.
- [ ] M2: CSS responsivo de diálogo com conteúdo rolável e alvos 44 px; câmera maior onde houver espaço, colisões preservadas; teste em paisagem/retrato e restauração após diálogo.
- [ ] M3: medir heading contra deslocamento real inclusive portões e escadas; verificar sete UUIDs e registros de atores; corrigir somente duplicação comprovada.
- [ ] M4: comparar fachada/campus/portões com referências antes de girar prédio; localizar pontos narrativos redundantes mantendo IDs e saves; priorizar objetos interiores existentes sem remover fatos históricos.
- [ ] M5: quadra azul com marcações distintas, traves/tabelas/rede recolhida e equipamentos leves; bola/placar/interações e rota física de Caio; colisões só estruturais; capturas e contadores.
- [ ] M6: regressão unitária completa uma vez, testes de navegador afetados e campanha; perfil final de 60 s por cenário, rádio ligado/desligado; build; relatório de bugs, arquivos, pendências e saves; PR sem merge.

Riscos verificados nos testes: saves intermediários; cabeçalhos longos/áreas de toque; retorno da câmera; mudança de parent e direção; portas e rotas independentes do jogador; recompensas idempotentes; rede/equipamentos não bloqueiam circulação. Hardware Android físico permanece separado de emulação. Não declarar microtravamento eliminado caso a reprodução não seja equivalente ao aparelho.
