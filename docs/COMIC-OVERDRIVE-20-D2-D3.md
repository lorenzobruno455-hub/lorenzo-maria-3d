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

Concluída no segundo commit deste bloco:

- Teto claro `#FFF8E9`, paredes claras quentes, piso marrom escuro `#60402F`; pavimentação externa `#69717D`. Tons são intenções sRGB próprias, não valores medidos na foto. Cor e bandas da proposta B são mantidas nos demais volumes.
- As bandas de piso preservam o matiz marrom/cinza também em grandes sombras. A primeira captura do salão revelou uma sombra violeta dominante; o shader foi corrigido e o salão recapturado. Posição de piso em 3,6/7,2 usa margem numérica no cálculo de altura local.
- Faixa de contato na base das paredes e sombra gráfica no encontro superior; teto mais claro permanece separado. Atenuação do highlight de vidro mantém alpha, depth sorting e material existentes.
- `school-comic-depth.js` lê os apoios/colisores já existentes e instala um único batch de contatos por piso carregado. Contatos: 215 no 1º, 243 no 2º, 15 no salão, conforme os pisos amostrados. Patches são planos no `walkY + 0,004`, com offset de profundidade; não criam colisão, sombra dinâmica, textura, interação ou bloqueio de câmera.
- Paredes e objetos suspensos são excluídos desses contatos. Novos buffers pertencem ao efeito e são liberados por ele; as geometrias dos GLBs continuam emprestadas. Roots acompanham a visibilidade e o streaming existentes.

### Cobertura e imagens

[Inventário com links aos 24 ambientes](captures/comic-overdrive-20-d3/ROOMS.md), [prancha de inspeção](captures/comic-overdrive-20-d3/rooms-contact-sheet.jpg) e [cobertura estruturada](captures/comic-overdrive-20-d3/coverage.json).

São **19 enquadramentos novos por sala + cinco capturas principais reutilizadas**, cobrindo os 24 ambientes da matriz. Nos 19 enquadramentos novos, a sala retornada pelos diagnósticos coincide com a sala solicitada. Dois corredores também foram inspecionados. O lote por sala registra a auditoria de composição/apoios anterior ao último ajuste de matiz nas sombras de piso; sala A, biblioteca, salão, corredor do 2º piso e exteriores têm capturas finais complementares. Isso evita repetir todos os ambientes após uma correção localizada de pigmento.

| Comparativo / vista | Evidência |
| --- | --- |
| Sala A, B inicial → B com piso real informado | [Antes/depois](captures/comic-overdrive-20-d3/classroom-comparison.jpg) |
| Biblioteca, P3/P4 → F3 | [Antes/depois](captures/comic-overdrive-20-d3/library-comparison.jpg) |
| Salão, P3/P4 → F3 | [Antes/depois](captures/comic-overdrive-20-d3/hall-comparison.jpg) |
| Campus, B inicial → pavimentação cinza | [Antes/depois](captures/comic-overdrive-20-d3/campus-comparison.jpg) |
| Segunda sala / corredor do 1º piso | [Sala C](captures/comic-overdrive-20-d3/classroom-c-after.jpg) · [Corredor](captures/comic-overdrive-20-d3/corridor-after.jpg) |
| Laboratório / corredor do 2º piso | [Laboratório](captures/comic-overdrive-20-d3/laboratory-after.jpg) · [Corredor](captures/comic-overdrive-20-d3/corridor-2-after.jpg) |
| Árvores e nuvens após correção da extrusão | [JPEG](captures/comic-overdrive-20-d3/trees-after.jpg) |
| Quadra existente, pavimentação / linhas | [JPEG](captures/comic-overdrive-20-d3/court-after.jpg) |
| Mobile 844×390, Baixo, toque habilitado | [Sala A](captures/comic-overdrive-20-d3-mobile/classroom-a-low.jpg) · [Biblioteca](captures/comic-overdrive-20-d3-mobile/library-low.jpg) · [Salão](captures/comic-overdrive-20-d3-mobile/hall-low.jpg) |

Desktop 960×600/Médio e mobile 844×390/Baixo, reduced motion, adaptive desligado, relógio 08:15, restauração v04 e câmera normal do jogador. Pranchas apenas organizam capturas sem retoque. Poses idle podem variar. Nenhuma câmera de produção foi alterada para compor as fotos.

O ambiente reiniciou durante um lote: seis fotos completas foram preservadas, mas os metadados daquele processo não chegaram a ser gravados. A retomada aproveitou essas fotos, coletou apenas os enquadramentos/metadados complementares necessários e passou a persistir o relatório **a cada captura**, permitindo retomar sem repetir salas. Processos interrompidos não contam como testes aprovados.

Reprodução com Vite ativo: `CAPTURE_ROOMS=1 CAPTURE_AUDIT=1 CAPTURE_RESUME=1 CAPTURE_DIR=docs/captures/comic-overdrive-20-d3 CAPTURE_MODE='' node scripts/capture-overdrive-20.mjs rooms`. `CAPTURE_CASES` seleciona cenas/IDs; `CAPTURE_MOBILE=1 CAPTURE_QUALITY=low` usa viewport móvel. `python scripts/report-overdrive-20-depth.py` monta as pranchas/inventário. As cinco imagens principais do inventário são explicitadas no script para não duplicar trabalho.

### Métricas e verificação

[Métricas finais desktop](captures/comic-overdrive-20-d3/after-metrics.json), [auditoria por ambiente](captures/comic-overdrive-20-d3/rooms-metrics.json) e [mobile](captures/comic-overdrive-20-d3-mobile/low-metrics.json). Lotes de auditoria usam três frames de estabilização e duas amostras de tempo para reduzir custo; não são benchmark. Os lotes F2 de comparação conservam oito amostras.

| Vista | Antes | Final | Triângulos antes → final |
| --- | --- | --- | --- |
| Campus, B D1 → F3 | 220 draws | 220 draws | 242.598 → 242.598 |
| Sala A, F2 → F3 | 89 draws | 90 draws | 136.010 → 136.440 |
| Salão, P3/P4 → F3 | 73 draws | 77 draws | 55.810 → 62.320 |

Os JSONs registram também geometrias, texturas, shaders, câmeras e tempos. Tinta e contatos não adicionam texturas; residência pode variar com carregamento assíncrono dos recursos existentes. Tempos são de Chromium/SwiftShader/software e não provam ganho/perda de FPS em celular. **S24 Ultra/A35/Chromebook físico seguem pendentes.**

- **13 unitários focados aprovados**: batch misto, UV sem costura indevida, callbacks restauráveis, largura, NPC no Baixo, instância/normal, contatos em Y correto, propriedade/streaming/descarte.
- **3 verificações browser aprovadas**, em execuções direcionadas: controles/presets/save; comparação exata de colisores, seis memórias e posição salva no andar superior contra D1; sete GLBs animados e largura de tinta entre presets/viewport.
- Capturas desktop/mobile sem erros de página/shader. O teste de identidade dos perfis foi atualizado de P3/P4 para o ID do novo padrão; a expectativa de largura antiga 1,15/0,9 foi atualizada para os 2,1 pixels solicitados pelo novo perfil. Nenhum limite de draw calls/geometrias foi ampliado.
- **Build final aprovado**: JS principal 416,79 kB / 117,43 kB gzip; Three 573,26 / 149,02 kB; CSS 47,41 / 9,93 kB. Aviso de chunk >500 kB já conhecido, sem nova dependência npm. `git diff --check` aprovado.
- **Revisão independente única**: identificou o sinal de normal em `BackSide` nas copas instanciadas. `FLIP_SIDED` foi compensado antes da extrusão; teste falhou antes e passou depois. Nenhum outro Critical/Important concreto encontrado. Sem nova rodada de revisão/testes estáveis.

Hashes dos arquivos do renderizador: [render-source.json](captures/comic-overdrive-20-d3/render-source.json). As capturas registram o HEAD local F2 `22ace48`, cuja árvore corresponde ao commit remoto `ef346ba`; o segundo commit contém a fonte F3 e os relatórios finais. Fotos de auditoria e fotos após o ajuste de matiz são distinguidas acima.

## Ponto de parada e próxima aprovação

Fases **2–3 entregues**. Escolha B e pisos informados incorporados. Conferência do diff confirma ausência de mudanças em modelos/dados narrativos, progress/checkpoint, física, controles, navegação, origem/entrada, PWA e HTML.

Para retomar: usar esta branch/relatório e verificar apenas se houve novos commits no GitHub. Aguardar autorização para **Fases 4–5**: fachada fiel, quadra anexa, proposta anotada da entrada lateral e revisão final. A posição exata da porta exige confirmação caso os croquis não a resolvam, conforme o PDF. Interface/cinematics usarão as referências registradas em `REFERENCIAS-HIFI-RUSH.md`. Regressão completa somente no fechamento da Fase 5. Sem merge nem deploy automático.
