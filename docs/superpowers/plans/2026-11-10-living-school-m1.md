# Living School 0.8.2 M1+M2 — plano econômico

Base: 0.8.1 validada, 50db300. Escopo autorizado: dois primeiros marcos do pedido Project Aurora 0.8.2. Execução direta, uma área por vez.

- [x] Auditar os 24 ambientes pela matriz/GLBs; capturar baseline e contadores nos nove ambientes pedidos e quadro.
- [x] Corrigir sinais conforme faces reais das paredes e UVs do atlas; testar raios de visibilidade dos dois lados e ausência de interseção.
- [x] Reaproveitar os tampos, materiais Colorbeat e batching para compor as oito salas: papelaria, livros, estojos e garrafas determinísticos apoiados. Não mover mesas, cadeiras nem paredes.
- [x] Acrescentar conteúdo legível às lousas, mural/calendário/mapa e relógio usando o atlas compartilhado existente. Sem textura por cartaz.
- [ ] Testes focados antes/depois, capturas comparáveis, métricas e revisão do diff. Regressão completa uma vez ao encerrar o M1, por CI do PR para evitar duplicação local.
- [ ] Entrega parcial com inventário e PR sem merge. M3–M4 pendentes.

Restrições: conservar seis livros, sete avatares, narrativas, controles, schema v04, carregamento por piso, colisões e arquitetura. Não alegar FPS físicos; sinalização e decoração são ficcionais originais. Priorizar buffers compartilhados, descarte idempotente, UVs válidos e oclusão normal.

Ampliação autorizada: M2 na mesma entrega. Reutilizar livros, estantes e mesas da biblioteca; variar preenchimento sem bloquear os seis livros narrativos. Murais de corredor somente em trechos sólidos e acima das passagens.
