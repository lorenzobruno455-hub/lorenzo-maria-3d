# Comic Overdrive 2.0 — fases 4–5

Base GitHub: PR #17, `086f2bc`. Branch `feat/aurora-comic-overdrive-20-d3-d4`, PR #18. Proposta B e pisos marrom escuro/cinza mantidos. Sem merge ou publicação.

## Fase 4 — implantação confirmada

O proprietário confirmou três portões: externo da quadra; portão existente da escola **dentro da quadra**; entrada voltada ao campus antigo que **abre diretamente na recepção**. A quadra é colada à escola. Esta correção substitui a proposta preliminar de afastamento registrada em `6abb9cd`; as capturas antigas em `comic-overdrive-20-d4/` são históricas.

Para orientar a recepção ao campus, aplicou-se uma rotação rígida de 180° ao prédio na origem `(60,0,0)`. Não houve espelhamento, troca de salas ou mudança nos croquis/GLBs. Transformação: `mundo=(60-localX, localY, -localZ)`. As coordenadas locais dos 24 ambientes, personagens e saves internos continuam iguais. A face da foto é tratada como face da rua, oposta ao campus; isso é adaptação de implantação no jogo, sem afirmar orientação geográfica real.

| Acesso | Coordenadas locais X/Z | Mundo X/Z | Destino |
| --- | --- | --- | --- |
| G1 | −11; 27 | 71; −27 | Exterior → quadra |
| G2 | 0; 19 | 60; −19 | Quadra → corredor existente |
| G3 | 11; −5,5 | 49; 5,5 | Campus → recepção diretamente |

Quadra no mundo `X=49…71,Z=−35…−19`, encostada no prédio em `Z=−19`. Caminho cinza pelo lado do campus e contorno norte levam aos acessos. O limite norte foi ampliado para `−37` somente no distrito novo; a antiga borda do campus continua protegida. Árvores, bancos, postes e edifícios antigos mantêm suas posições.

A parede externa da recepção ganhou um vão estreito de 2,6 unidades, com verga, identificação e batentes. A janela desse trecho foi substituída pelo acesso. O portão G2 e o vão original permanecem. Os três portões reutilizam o sistema existente de pivô, animação e colisão; não entram na lista persistente das duas portas antigas. G1 abre por proximidade; G2/G3 aguardam a chegada do piso carregado. Selos físicos impedem entrar antes disso.

Fachada procedural: massa de três níveis, faixas rosa e azul, paredes claras, janelas, grade branca, letreiro; quadra azul com cobertura curva avermelhada. Sem emblema copiado, infraestrutura amarela inventada, modelo externo ou dependência nova. Geometrias/materiais compartilhados e batches estáticos; um atlas de letreiro/recepção 512×128. A camada exterior deixa de renderizar em inspeção e nos interiores afastados dos portais.

[Vista da fachada](captures/comic-overdrive-20-d4-confirmed/overview-annotated.png) · [Os três portões](captures/comic-overdrive-20-d4-confirmed/entry-annotated.png).

As imagens são capturas reais, com pontos projetados a partir da câmera real. A segunda usa um corte **somente na revisão**, ocultando a cobertura da quadra para mostrar G2. O jogo mantém a cobertura. Queries históricas conservam sua orientação antiga para comparação; o padrão e a prévia confirmada usam a implantação nova.

## Compatibilidade

Mundo contínuo na mesma cena, sem teletransporte. Vetores de movimento, colisores e yaw da câmera são transformados entre os referenciais; mudar de parent preserva a pose mundial. Saves v04 não são migrados: posições internas permanecem locais e externas permanecem mundiais. Só o pequeno vão da recepção amplia a validação de posição. Um save externo antigo sobre a parede da porta anterior é recuperado no entorno livre, sem cair em uma sala ainda descarregada. Sete personagens, seis memórias, missões, três pavimentos, checkpoint e controles permanecem sob os sistemas existentes.

## Fase 5 — revisão e validação

Acabamento original dos painéis com áreas diagonais, cores de impressão, títulos marcados, seleção amarela e hierarquia de leitura, a partir das referências registradas em [Referências Hi-Fi RUSH](REFERENCIAS-HIFI-RUSH.md). Nenhum asset copiado. Alvos de toque e controles não foram recortados; reduced motion e alto contraste mantidos. A página Behance integral permaneceu indisponível (403); não se atribuem detalhes não inspecionados a ela.

Validação final, capturas de dez cenas e métricas: em andamento. Resultados serão registrados ao concluir, sem repetir suítes completas por alteração. FPS físico Android permanece pendente de teste em aparelho; tempos de SwiftShader não equivalem a FPS de telefone.
