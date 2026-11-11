# Comic Overdrive 2.0 — bloco 2–3

## Decisões confirmadas e continuidade

Base GitHub reconferida: PR #16, `c0cb497`, D0–D1 não mesclado. Autorização recebida para fases 2–3. O proprietário escolheu explicitamente **B — Sombra elétrica** e informou: **piso marrom escuro nas salas e corredores; piso externo pavimentado cinza**. Essas cores prevalecem sobre o piso violeta da proposta inicial e sobre a sugestão fria genérica do PDF.

Branch: `feat/aurora-comic-overdrive-20-d2`. Plano/registro de retomada: [fases 2–3](superpowers/plans/2026-11-11-overdrive-20-d2-d3.md). Reutiliza a auditoria D0, sem reconstruir o prédio nem mudar porta, world-space ou narrativa. Fases 4–5 permanecem fora deste bloco.

## Fase 2 — tinta ampliada

- Bordas de caixas no próprio material, por UV contínua da face. Um atributo compartilhado distingue caixas de cilindros/esferas/folhas; não aparecem diagonais da triangulação nem costura vertical falsa nas formas arredondadas.
- O batcher preenche o atributo ausente com zero em geometrias nativas. Um teste reproduziu a incompatibilidade de merge ao misturar caixa do cache e torus nativo antes da correção.
- Campus combina bordas UV em pixels CSS com seu draw de arestas selecionadas já existente, escurecido. Escola combina estrutura, bordas existentes dos móveis, janelas, batentes e faixa institucional, em um batch por root/piso. Nada de novo shadow map ou outline global em pós-processamento.
- Copas reutilizam os mesmos shells instanciados, agora com projeção em pixels e normal já transformada pela instância. Nuvens reforçam a linha no atlas existente de 512×128. Troncos, portas articuladas e props em caixas usam a borda no próprio shader.
- Os shells dos sete personagens continuam ligados ao rig original. NPCs próximos mantêm a silhueta principal no Baixo; alcance limitado evita custo indiscriminado em atores distantes.
- O visual B ampliado torna-se padrão desta branch. `?comic=overdrive-20-d2` conserva a etapa só de contornos; `?comic=overdrive-20-a` e `?comic=overdrive-20-b` mantêm os estudos D1. `?comic=overdrive-p3-p4` conserva a entrega anterior para comparação.

### Evidências da Fase 2

960×600, Médio, sombras ligadas, exposição 1, adaptive desligado, relógio 08:15. [Métricas antes](captures/comic-overdrive-20-d2/before-metrics.json) / [depois](captures/comic-overdrive-20-d2/after-metrics.json). Antes = B D1; as cores de piso depois já incorporam a correção direta do proprietário.

| Cena | Antes | Depois |
| --- | --- | --- |
| Campus / pavimentação | [JPEG](captures/comic-overdrive-20-d2/campus-before.jpg) | [JPEG](captures/comic-overdrive-20-d2/campus-after.jpg) |
| Árvores / nuvens | [JPEG](captures/comic-overdrive-20-d2/trees-before.jpg) | [JPEG](captures/comic-overdrive-20-d2/trees-after.jpg) |
| Quadra já existente no campus | [JPEG](captures/comic-overdrive-20-d2/court-before.jpg) | [JPEG](captures/comic-overdrive-20-d2/court-after.jpg) |
| Sala A / móveis / armário | [B D1, captura existente reutilizada](captures/comic-overdrive-20/classroom-a-b.jpg) | [JPEG](captures/comic-overdrive-20-d2/classroom-a-after.jpg) |

O enquadramento novo `trees` permite ver as copas e o céu sem o tronco em primeiro plano do enquadramento D0 `sky-tree`; a câmera do jogo não foi alterada. A quadra fotografada aqui é a do campus antigo; a quadra anexa real pertence à Fase 4.

| Cena | Draw calls B D1 → F2 | Triângulos B D1 → F2 |
| --- | --- | --- |
| Campus / árvores | 220 → 220 | 242.598 → 242.598 |
| Quadra existente | 131 → 131 | 187.914 → 187.914 |
| Sala A | 89 → 89 | 129.674 → 136.010 |

O protótipo que expandia todas as linhas do campus em quads foi descartado após a medição; as bordas UV permitem manter as contagens exteriores. Não foram criadas texturas. Residência e frame times de software constam nos JSONs; não representam FPS Android.

Verificação de Fase 2: **11 unitários direcionados aprovados** e **1 teste browser aprovado** com toque CDP real, NPCs no Baixo, presets e gravação v04. Capturas finais 3D sem erros de página/shader e build aprovado. Capturas iniciais detectaram incompatibilidade de atributos no batch; a causa foi corrigida com regressão específica, sem mudar limiares dos testes.

## Fase 3 — profundidade

Em andamento neste commit; entrega e métricas complementadas no commit próprio da Fase 3. A regressão geral continua reservada à Fase 5; testes físicos Android/Chromebook não foram executados nesta máquina.
