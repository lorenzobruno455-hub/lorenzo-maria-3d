# Auditoria 0.5 — antes da reconstrução

Inspeção de world, campus-world, story-world, character, camera, physics, story, living, recursos, dados e testes existentes. Capturas antes em captures/v05.

Causas encontradas:
- story-world.add aplica y=1.05 a todos os itens; não existe superfície correspondente. Memórias giram no ar e marcadores luminosos permanecem ativos.
- campus-world.addObject repete y=.95 sem suportes (livro, partitura, bilhete e cardápio).
- Estantes maciças têm livros embutidos no bloco, sem prateleiras; biblioteca reutiliza o mesmo mobiliário da sala.
- Pernas das cadeiras são barras horizontais muito baixas; banco de reflexão e assentos dos NPCs não possuem pernas.
- Flores em y=.95 não têm hastes; camas de arbustos chegam apenas a .5.
- Piso externo varia de -.02 a .045, interior .12; raiz de todos os personagens permanece em .08, independentemente da superfície.
- Objetivos de memória são caixas idênticas; não existem livros individuais na biblioteca.
- Interações estão distribuídas em nearestTarget, Story e LivingSchool; visibilidade é verificada num plano fixo y=1.5, inadequado para livros baixos.
- Janelas são placas sobre parede opaca. Necessário criar vãos reais e peitoris.

Ordem: posicionamento/superfícies e diagnóstico; corrigir geometria; biblioteca de props; reconstruir interiores; integrar interações e livros; validar imagens e regressões.

fal: recomendou Tripo H3.1. Envio com chave lorenzo-maria-v05-chair-20261107-01 recusado: submission journal unavailable (403); consulta posterior not_found proíbe reenvio automático. Nenhum modelo gerado foi integrado. Superpowers consta instalado no catálogo, porém não forneceu ferramentas nem skill no catálogo cloud/executor desta sessão; não alegamos sua execução.
