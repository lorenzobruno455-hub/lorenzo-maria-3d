# Comic Overdrive 2.0 — bloco 4–5

## Base e escopo

Base GitHub reconferida: PR #17, `086f2bc`, entrega das fases 2–3. Branch `feat/aurora-comic-overdrive-20-d3-d4`. Proposta B, pisos marrom escuro/cinza, sete GLBs, seis memórias, save v04, checkpoint, mundo contínuo e matriz dos 24 ambientes preservados.

O proprietário autorizou o bloco 4–5. O PDF também determina um portão específico de confirmação da entrada quando as referências não a resolvem. Os croquis de primeiro/segundo piso foram revistos: mostram salas/corredor, mas **não posicionam a porta externa nem a quadra**. A fotografia mostra o volume anexo à direita, não prova a entrada funcional exata.

## D3 — proposta concreta para confirmação

- Prévia procedural isolada em `?comic=overdrive-20-d3-preview`; o padrão jogável permanece a entrega F3 até confirmar a implantação.
- Fachada no lado comprido oeste do modelo atual, mantendo a origem `(60,0,0)` e todos os interiores. Massa de três pisos, paredes claras, faixa rosa superior/azul intermediária, fileiras de janelas, grade branca e letreiro principal.
- Volume anexo azul, fascia/cobertura avermelhada curva, painel azul pequeno visível na foto. O painel não foi declarado a entrada. Nenhum emblema, texto secundário, infraestrutura amarela ou interior esportivo inventado.
- Distâncias e proporções do anexo são adaptações de jogo, não medidas levantadas. Volumetria/afastamento precisam de aprovação na implantação; os props da conexão não foram movidos.
- Geometrias/materiais compartilhados, batches estáticos, uma textura de letreiro 512×64. Cobertura procedural simples; sem download de modelo ou dependência nova.
- **Nenhum novo colisor**, alteração de porta, limites de movimento, transform dos interiores ou migração de saves foi aplicada nesta prévia.

### Render anotado

[Vista geral anotada](captures/comic-overdrive-20-d4/overview-annotated.png) · [Aproximação anotada](captures/comic-overdrive-20-d4/entry-annotated.png).

| Marca | Significado / proveniência |
| --- | --- |
| 1 | Fachada principal: identidade rosa/azul/clara, janelas, grade e letreiro observados na fotografia. Proporções do modelo adaptadas ao jogo. |
| 2 | Quadra/anexo à direita da referência: azul + cobertura vermelha observados; posição, dimensões e afastamento propostos nesta implantação. |
| 3 | Portão lateral proposto em `(46,8; 20,4)` X/Z do jogo, entre prédio e anexo. **A confirmar.** |
| 4 | Porta atual do corredor em `(60;19)`, preservada. Traçado amarelo propõe ligação a pé entre o portão 3 e essa porta. **Confirmar essa relação funcional.** |

A entrada lateral foi informada pelo proprietário; a posição exata não foi presumida a partir da ilustração. A confirmação solicitada refere-se à disposição 2/3/4. Não basta a autorização genérica de continuar para transformar coordenadas hipotéticas em definitivas.

As imagens são renders reais do jogo com a câmera de revisão da prévia, usando o mesmo `FollowCamera`, materiais e iluminação. Não são fotos da escola nem imagens geradas. O HUD foi ocultado apenas na captura para permitir inspeção; câmera durante a caminhada e interface padrão não mudam. `exterior-view=overview` ou `entry` seleciona a vista da revisão; sem esse parâmetro a prévia mantém a câmera normal.

Fonte das anotações: pontos do modelo projetados pela posição/alvo reais da câmera, não marcação visual arbitrária. Scripts `annotate-school-entry.mjs` e `.py`. [Pontos/proposta](captures/comic-overdrive-20-d4/annotation-points.json), [métricas da vista geral](captures/comic-overdrive-20-d4/overview-metrics.json) e [aproximação](captures/comic-overdrive-20-d4/entry-metrics.json). Tempos de auditoria de software não são FPS físico.

## Verificação e ponto de retomada

**2 unitários focados e 1 browser aprovados**: descarte/propriedade, ausência de colisores novos, três pisos/faixas e elementos observados; comparação exata da lista de colisores, progresso e posição salva antes/depois da prévia; câmera de revisão restrita à query e retorno ao padrão. Capturas sem erro de página/shader. Hashes em [render-source.json](captures/comic-overdrive-20-d4/render-source.json).

Build aprovado: JS principal 421,51 kB / 119,38 kB gzip; CSS e núcleo Three preservados. `git diff --check` aprovado. Vista geral: 92 draws / 162.294 triângulos / 98 geometrias / 14 texturas residentes; aproximação: 74 / 48.082 / 97 / 12. Vistas diferentes, portanto não comparar estes números como ganho de FPS. Material/textura próprios são descartados pela prévia; recursos compartilhados continuam com seu proprietário.

A regressão completa fica reservada ao estado final após confirmar o acesso, para não validar uma navegação provisória duas vezes. Os testes de toque, sete GLBs e memórias da entrega anterior não foram repetidos neste checkpoint.

**Pendente:** confirmação concreta da disposição marcada 2/3/4. Depois: incorporar exterior/acesso, validar ida/volta e saves, concluir revisão UI/cinematics com referências já registradas e executar regressão completa/CI uma vez. Não declarar fases 4–5 concluídas antes disso. Sem merge nem publicação automática.
