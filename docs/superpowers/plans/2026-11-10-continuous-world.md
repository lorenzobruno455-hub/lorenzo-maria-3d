# Aurora 0.9 — mundo contínuo

Base GitHub 9132f87 (0.8.2 M4 + botão fullscreen). Implementação direta autorizada pelo pedido detalhado.

## Decisões da auditoria

Campus: limites físicos X=-38…38, Z=-27…29; solo gráfico X=-41…41. Música ocupa X=28…36, Z=-16…-6; árvores X=32 em Z=13/24. Conexão pela faixa Z=20 não cruza essas estruturas. São Jorge será transladado em +60 no eixo X, sem rotação: ocupa X=49…71, Z=-19…19. O campus e os dados originais não serão movidos. Novos limites X=-38…82, Z=-27…29.

A geometria interna, narrativa e colisores do São Jorge continuam locais. O grupo do prédio representa a transformação `mundo = local + (60,0,0)`. Ao cruzar fisicamente a porta, avatar e câmera mudam de referencial por `attach`, preservando a transformação mundial; não muda a cena nem se redefine a posição mundial. Isso reaproveita M1–M4 e seus saves sem reescrever coordenadas de missões. Projeções, enquadramentos e bounds devem respeitar o referencial pai.

## Etapas

- [ ] Testar transformação/reparenting sem deslocamento mundial e portal físico; abrir somente o vão necessário na parede frontal, mantendo GLBs originais intactos.
- [ ] Conexão externa original com piso, árvores, bancos, iluminação e proxy leve do prédio; porta reaproveita o controlador existente. Pré-carga por aproximação, bloqueio físico recuperável durante falha/carga.
- [ ] Adaptador contínuo sobre SchoolVisit: entrada/saída por movimento, sem botões de viagem; mesmos atores/props/quest engines. Manter navegação por pavimento e transições existentes de escadas.
- [ ] Preservar saves v04 locais do São Jorge e ampliar apenas a validação da posição mundial fora dele. Atualizar câmera/projeções para pais transformados.
- [ ] Testes focados de caminhada/porta/retorno, saves nos dois referenciais, campanhas, escadas, Android, câmera e recursos. Atualizar cenários antigos que dependiam de botões de teletransporte para caminhada física, sem removê-los.
- [ ] Capturas e métricas reais, revisão e regressão completa final. PR sobre a branch 0.8.2, sem merge automático ou publicação no Sites.

Limites: somente entrada/saída campus–São Jorge passam a ser contínuas. Escadas mantêm seus patamares já existentes e seleção de colisão por piso; não se reconstrói a escadaria. Os mesmos personagens/objetos são emprestados pelo adaptador narrativo dentro da escola e restaurados ao campus ao sair, sem duplicar progressos. A distância e a oclusão orientam a apresentação; não haverá fade de cena ou tela de seleção de destino.
