# Aurora 0.9.3 — perímetro e paisagismo

Base limpa: 028de618, versão publicada0.9.3. Branch dedicada feat/aurora-093-perimeter-landscape. Execução direta conforme preferência do proprietário; publicar somente depois da validação, autorizado pela última frase da solicitação. Não fazer merge na main.

Plano: contorno institucional de seis segmentos seguindo os limites jogáveis e o recorte norte do campus antigo; não criar portões falsos. Colisões do muro coincidem com os limites já existentes ou ficam fora deles. Vegetação procedural determinística em grupos, materiais/geometrias compartilhados, árvores instanciadas e flores/arbustos opacos leves. Troncos têm AABB simples; canteiros baixos não introduzem obstáculos pequenos. Reservar corredores de circulação, três acessos e pontos narrativos. Culling por grupo e sombras por preset, sem animações/listeners/loops novos.

Verificação: cobertura e colisões do perímetro; caminho contínuo ao redor das áreas acessíveis; três portões livres; rotas de NPCs e objetivos; captura real antes/depois com câmera fixa; recursos de renderização; Android emulado; regressão unitária e build. Não inventar FPS físico. Saves e dados narrativos não mudam.
