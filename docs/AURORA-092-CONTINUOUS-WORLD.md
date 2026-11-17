# Aurora 0.9.2 — continuidade física

Base: feat/aurora-narrative-expansion, 18fa519 (PR #19), limpa após fetch. Main não alterada. Sem novas missões, reescrita de diálogos ou publicação.

## M1 — auditoria e projeto

Medidas em unidades do jogo, não medidas da escola real: envelope X ±11, Z ±19; pisos Y 0.03 / 3.63 / 7.23, espaçamento 3.60. Corredor central X -2..2. Escadaria antiga do térreo ocupa X -11..-2, Z -0.5..5.5; a do segundo pavimento ocupa X -11..-2, Z -8..-2. Os recintos não se sobrepõem em planta. A API antiga transition/useStair muda imediatamente piso/posição. SchoolNarrative.enter/leave troca rotas e restaura poses de NPCs, impedindo viagens independentes do jogador.

Decisão arquitetônica: duas escadarias retas de dois lances com patamar intermediário, sobrepostas verticalmente no eixo do corredor (X ±0.8, Z +6..-6), com guarda-corpos e circulação lateral. Isso conecta os acessos existentes dos recintos de escadas sem demolir paredes/divisórias nem ocupar as salas desalinhadas. Vãos reais nos pisos superiores apenas no corredor, X ±1.02, Z -6.2..6.2. Salas, três portões, fachada, recepção e quadra preservados. Largura de circulação lateral exige A* com malha de 0.5, reutilizando o solver existente. Cada lance vence 1.8; patamar de 1.2; degraus visuais e superfície contínua de suporte, com bloqueio lateral e de vãos. Não há ação E para mudar de piso.

Plano de execução: M2 geometria/vãos/motor/câmera/save Y, testes de continuidade/parada/inversão; M3 um gerenciador compartilhado de rotas 3D para os atores existentes, posições mundiais persistentes e atualização escalonada; M4 adaptação de objetivos e registros de navegação, regressão focada e build. Cada marco recebe commit, sem pausa de aprovação entre marcos conforme instrução do proprietário.

Os testes antigos que acionam E em um patamar não validam mais escadas e precisam de cobertura por caminhada física; não serão mantidos como atalhos ocultos. Saves antigos conservam os domínios narrativos; somente posições inválidas após a abertura de um vão são recuperadas pelo resolvedor já existente. Saves novos registram Y e estado espacial dos NPCs.
