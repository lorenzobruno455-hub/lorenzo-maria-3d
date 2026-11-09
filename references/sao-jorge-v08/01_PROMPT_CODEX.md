# PROMPT MESTRE PARA CODEX — LORENZO & MARIA 3D v0.8

**Projeto:** https://github.com/lorenzobruno455-hub/lorenzo-maria-3d
**Atualização:** Project Aurora 0.8 — São Jorge 3D
**Orçamento:** R$ 0, usando Three.js/Vite e modelos originais/gratuitos.

Você é o engenheiro e artista técnico responsável por integrar ao jogo uma recriação **artística, completa e navegável** do Colégio São Jorge, inspirada nos croquis e nas referências visuais anexadas. Não mude a história, remova conteúdo anterior ou refaça a arquitetura do projeto sem necessidade.

## PRIORIDADE ZERO: verificar contexto e preservar trabalho

1. Inspecione as branches `main`, `feat/aurora-07a`, `feat/aurora-07b` e `feat/aurora-07c`, o histórico de commits e os PRs.
2. Se 0.7C existir só parcialmente, **não apague mudanças não commitadas**. Integre 0.8 sobre a base mais recente **realmente disponível e estável**. Relate a base selecionada.
3. Crie branch própria `feat/aurora-08-sao-jorge` e informe o PR-base apropriado se a main estiver atrás.
4. Antes de editar: execute testes, examine `src/`, loaders GLB, `world`, `physics`, `camera`, `story`, `interaction-registry`, saves e quality presets.

## ARQUIVOS DE REFERÊNCIA

Leia e utilize ANTES de modelar:
- `00_COMECE_AQUI.md` e `documentos/02_FONTE_DE_VERDADE.md`;
- `documentos/03_DIRECAO_ARTISTICA.md`;
- `documentos/04_PLANO_DE_EXECUCAO.md`;
- `dados/escola_v08_referencias.json`;
- os croquis originais `referencias/planta_usuario_1_andar.jpeg` e `planta_usuario_2_andar.jpeg`;
- GLBs em `modelos/*.glb` e visualizador HTML como ponto de partida, NÃO como representação arquitetônica certificada.

Os rascunhos de projeto anteriores, tabelas com medidas 22 × 40m, áreas m² e números de sala são **hipóteses**, não medidas reais. No 3º andar, apenas o uso como SALÃO foi confirmado; palco/deposito são ideias opcionais, não fatos.

## OBJETIVO VISUAL

O jogador precisa reconhecer a atmosfera da escola: paredes branco-quentes, detalhes azuis, cadeiras azuis, pisos de madeira em salas onde plausível, corredores claros, madeira nas portas e detalhes vermelhos institucionais. Mantenha o mundo Colorbeat estilizado e coerente com os personagens, não misture fotorealismo cru e toon shading. Texturas, iluminação, contornos, escala e mobiliário devem formar um conjunto bonito e otimizado.

## CENÁRIO JOGÁVEL

Produza os três andares:

- 1º andar: salas de aula, banheiros M/F, escadas, sala dos professores, biblioteca, direção, outras salas e setores administrativos identificados no croqui.
- 2º andar: salas de aula, banheiros M/F, escadas, sala de ciências, coordenação e laboratório, conforme croqui.
- 3º andar: um salão multiuso amplo e interativo, conectado por circulação vertical ficcionalizada; sem presumir palco ou instalações não confirmadas.

**Não reproduza fielmente infraestrutura restrita, dispositivos de segurança ou rotas operacionais de um colégio real.** Onde uma planta for ambígua, crie uma solução de jogo segura e coerente, sinalizando que é inferência. Ampliar cenário é permitido para melhorar circulação, mas não atribua dimensões inventadas ao prédio real.

Cada espaço deve ser mobiliado conforme sua função e permitir exploração em terceira pessoa, colisões, iluminação, portas e interações. Inclua mobiliário, objetos de ambientação, quadros, livros, computadores cenográficos, cadeiras, mesas, luminárias e outros detalhes de uma escola, respeitando performance. A biblioteca precisa suportar seis livros de memória e as missões legadas. O salão pode receber cenas narrativas futuras, sem criar conteúdo histórico falso.

## ARQUITETURA / SISTEMAS

- Reuse a cena e sistemas existentes: não duplique personagem, câmera, interação, progresso, NPCs ou missões.
- Integre os GLBs realmente disponíveis, garantindo `GLTFLoader`, caminho Vite correto, escala/pivô, animação quando houver, desduplicação e descarte de GPU.
- Divida por andar e ambientes; crie gestor de visibilidade/streaming. Mantenha modo de inspeção com opção `1º / 2º / 3º / todos` para desenvolvimento, sem interromper jogabilidade normal.
- Implemente colisões e navegação coerentes, especialmente transições de pisos, sem objetos suspensos nem interiores inacessíveis.
- Atualize spawn, câmera, objetivos, waypoints e NPCs SEM quebrar os capítulos já implementados.
- Crie mapa de coordenadas **do jogo**, separados das posições reais da escola. Gere `docs/SAO_JORGE_ROOM_MATRIX.md` com provenance de cada espaço.
- Preserve saves antigos ou faça migração testada com backup/fallback.
- Disponibilize qualidade Baixa/Média/Alta e testes Android por toque; nunca prometa FPS sem benchmark real.
- Não use serviços pagos, assets sem licença ou fotografias de menores como texturas.

## EXECUÇÃO EM QUATRO MARCOS (COM COMMITS)

**M1 — Estrutura e navegação:** validar os GLBs, corrigir agrupamento, garantir três pisos, navegação, transições, câmera e colisões. Captura real dos 3 andares; testes básicos.

**M2 — Identidade e ambientes:** mobiliário, cores, materiais, iluminação, biblioteca, salas, laboratórios e salão com detalhamento progressivo; validar objetos apoiados.

**M3 — Integração narrativa:** reposicionar interações, livros das memórias, NPCs, missões e pontos de cena; salvar/carregar com consistência, sem apagar a campanha.

**M4 — Polimento e publicação:** otimizar draws/geometrias/texturas, testes unitários e Playwright, mobile emulado, capturas comparativas, build, documentação e Pull Request.

Entre marcos, valide o jogo e corrija regressões antes de avançar. Se estourar limites de sessão, salve progresso **por commits organizados** antes de tentar mais tarefas; descreva pendências explicitamente.

## CRITÉRIOS MÍNIMOS

- 3 andares distinguíveis e navegáveis; salão no 3º.
- Todos os **tipos de ambiente identificados nos croquis** representados, sem alegar reprodução exata do prédio real.
- Mobiliário e cores coerentes, com assets validados e sem elementos flutuando.
- Biblioteca das Memórias, campanha, NPCs e controles existentes continuam acessíveis.
- Troca de andar, câmera, colisões e salvamento funcionais.
- Build e testes automáticos sem falhas bloqueantes; registrar limitações de desempenho físico.
- `docs/ENTREGA-08.md` relata implementado, suposto, não implementado, testes e screenshots.
- PR aberto em branch própria, **sem merge automático na main**.

**COMECE PELA AUDITORIA E M1.** Não declare a 0.8 concluída se só gerou a maquete ou uma imagem; precisamos de integração jogável de verdade.
