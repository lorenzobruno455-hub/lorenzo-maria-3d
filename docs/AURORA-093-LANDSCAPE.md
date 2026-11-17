# Aurora 0.9.3 — perímetro e paisagismo

Base limpa: 028de618, versão publicada0.9.3. Branch dedicada feat/aurora-093-perimeter-landscape. Execução direta conforme preferência do proprietário; publicar somente depois da validação, autorizado pela última frase da solicitação. Não fazer merge na main.

Plano: contorno institucional de seis segmentos seguindo os limites jogáveis e o recorte norte do campus antigo; não criar portões falsos. Colisões do muro coincidem com os limites já existentes ou ficam fora deles. Vegetação procedural determinística em grupos, materiais/geometrias compartilhados, árvores instanciadas e flores/arbustos opacos leves. Troncos têm AABB simples; canteiros baixos não introduzem obstáculos pequenos. Reservar corredores de circulação, três acessos e pontos narrativos. Culling por grupo e sombras por preset, sem animações/listeners/loops novos.

Verificação: cobertura e colisões do perímetro; caminho contínuo ao redor das áreas acessíveis; três portões livres; rotas de NPCs e objetivos; captura real antes/depois com câmera fixa; recursos de renderização; Android emulado; regressão unitária e build. Não inventar FPS físico. Saves e dados narrativos não mudam.

## Resultado

Muro institucional de seis segmentos, com pilares, plinto e faixa azul, sem novos portões falsos. Os três acessos existentes permanecem internos ao perímetro. Um fundo de terreno não navegável, abaixo do piso existente e ocultado pela névoa à distância, elimina bordas de terreno visíveis; limites físicos não foram ampliados.

No save de medição:39 novas árvores,132 flores,17 áreas de paisagismo, agrupadas em cinco regiões. Bosques nas bordas oeste/norte/sul/leste, jardins de convivência e da transição, entorno externo do São Jorge/quadra e dois canteiros baixos da recepção. O plantio protege pontos de interação e as posições carregadas dos personagens; não modifica nem migra saves. A quantidade pode variar discretamente para manter esses pontos livres.

Vegetação opaca instanciada, geometrias compartilhadas, três batches de muro para o perímetro inteiro, culling regional e sombras reduzidas por preset. As plantas externas seguem a ocultação de exteriores já adotada nos interiores; o muro e o fundo do terreno permanecem disponíveis para evitar vazio. Sem timers, listeners, física de plantas ou reconstrução por frame.

## Testes

- 209 testes unitários aprovados; build de produção aprovado.
- Cinco cenários de navegador: percurso físico completo do contorno acessível usando WASD/corrida; retorno e reload; save legado em posição onde poderia nascer uma árvore, mantendo posição e movimento; NPC entrando na recepção independentemente do jogador; Caio atravessando o portão da quadra; Lorenzo entrando/saindo do São Jorge com os mesmos sete atores. Os dois casos do arquivo landscape e os três casos reutilizados totalizam cinco.
- Contorno fechado, portões livres, colisões, câmera contra muro, proteção de pontos, determinismo e descarte sem destruir recursos compartilhados têm cobertura unitária. O percurso foi testado antes do reagrupamento visual do muro; seu contorno e colisões permaneceram idênticos e foram revalidados após ele.
- Testes de movimento em Android emulado usaram640×360 CSS com buffer320×180 para economizar renderização por software. As medições/capturas usam915×412, preset Baixo, sombras/adaptativo desligados, mesma câmera/seed,60s por cenário antes/depois. Rádio ligado no cenário São Jorge. Não são FPS de aparelho físico.

## Impacto medido

| Cena | Draw calls antes → depois | Triângulos antes → depois | Geometrias GPU | Texturas |
|---|---:|---:|---:|---:|
| Campus |196 →216|221204 →239256|111 →116|23 →23|
| São Jorge |132 →148|206752 →221132|136 →141|13 →13|

O primeiro agrupamento custava41 draw calls extras no campus; a consolidação do muro por material reduziu isso para20. P50/P95/P99 e picos dos quatro intervalos de60s estão em `docs/landscape-metrics.json`. SwiftShader apresenta tempos de frame altos/variáveis; não há garantia de ausência de engasgos no Android físico. Validar no Galaxy S24 Ultra e aparelho mais simples continua pendente. Não foram alterados A*, escadas, missões, dados históricos, rádios ou formato/chave de save.

## Arquivos e capturas

Código: `src/systems/landscape-layout.js`, `src/systems/campus-landscape.js`, integração localizada em `src/main.js`. Testes: `tests/unit/landscape.test.js`, `tests/landscape.spec.js`. Documentação/medição: este relatório e `docs/landscape-metrics.json`.

Capturas reais em `docs/captures/landscape`: `campus-before.png`/`campus-after.png`, `school-before.png`/`school-after.png`, `grove.png`, `reception-garden.png` e `npc-entry.png`. Câmeras de diagnóstico fixas, sem imagens geradas artificialmente. As capturas históricas anteriores foram preservadas.

Publicação autorizada ao final pelo proprietário; o mesmo endereço e a identidade da PWA serão preservados. Sem merge na main do GitHub.
