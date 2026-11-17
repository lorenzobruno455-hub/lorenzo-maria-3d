# Aurora 0.9.2 — continuidade física

Base: feat/aurora-narrative-expansion, 18fa519 (PR #19), limpa após fetch. Main não alterada. Sem novas missões, reescrita de diálogos ou publicação.

## M1 — auditoria e projeto

Medidas em unidades do jogo, não medidas da escola real: envelope X ±11, Z ±19; pisos Y 0.03 / 3.63 / 7.23, espaçamento 3.60. Corredor central X -2..2. Escadaria antiga do térreo ocupa X -11..-2, Z -0.5..5.5; a do segundo pavimento ocupa X -11..-2, Z -8..-2. Os recintos não se sobrepõem em planta. A API antiga transition/useStair muda imediatamente piso/posição. SchoolNarrative.enter/leave troca rotas e restaura poses de NPCs, impedindo viagens independentes do jogador.

Decisão arquitetônica: duas escadarias retas de dois lances com patamar intermediário, sobrepostas verticalmente no eixo do corredor (X ±0.8, Z +6..-6), com guarda-corpos e circulação lateral. Isso conecta os acessos existentes dos recintos de escadas sem demolir paredes/divisórias nem ocupar as salas desalinhadas. Vãos reais nos pisos superiores apenas no corredor, X ±1.02, Z -6.2..6.2. Salas, três portões, fachada, recepção e quadra preservados. Largura de circulação lateral exige A* com malha de 0.5, reutilizando o solver existente. Cada lance vence 1.8; patamar de 1.2; degraus visuais e superfície contínua de suporte, com bloqueio lateral e de vãos. Não há ação E para mudar de piso.

Plano de execução: M2 geometria/vãos/motor/câmera/save Y, testes de continuidade/parada/inversão; M3 um gerenciador compartilhado de rotas 3D para os atores existentes, posições mundiais persistentes e atualização escalonada; M4 adaptação de objetivos e registros de navegação, regressão focada e build. Cada marco recebe commit, sem pausa de aprovação entre marcos conforme instrução do proprietário.

Os testes antigos que acionam E em um patamar não validam mais escadas e precisam de cobertura por caminhada física; não serão mantidos como atalhos ocultos. Saves antigos conservam os domínios narrativos; somente posições inválidas após a abertura de um vão são recuperadas pelo resolvedor já existente. Saves novos registram Y e estado espacial dos NPCs.

## Correção arquitetônica solicitada pelo proprietário

A proposta inicial no corredor foi descartada antes da entrega. O proprietário determinou escadas dentro da sala de escadas e autorizou reorganizar ambientes inteiros para obter um encaixe coerente. A escadaria em U agora ocupa X -10.3..-3.1, Z 0.6..4.4, dentro da sala existente do térreo X -11..-2, Z -0.5..5.5. O vão no salão e no segundo piso coincide com essa área, fora do corredor X -2..2.

Segundo piso: Sala B passa de Z 5..12 para 5.5..12; banheiro masculino vai para -8..-4.25; banheiro feminino para -4.25..-0.5; sala de escadas passa para -0.5..5.5. Os quatro ambientes mantêm seus IDs e funções, com paredes, portas, pisos e mobiliário remapeados integralmente. A sala de ciências, os ambientes da direita, os corredores e a arquitetura do térreo não são deslocados. A matriz JSON original permanece intacta; a adaptação é explícita no carregamento e não deixa partes de cômodos antigos.

M2 validado em navegador: subida pelos dois lances de cada piso, parada/inversão, reload em uma altura intermediária preservada, chegada ao salão e descida física pelos mesmos lances até o térreo. Duas capturas reais registradas. O teste usa somente teclas e leitura de diagnóstico, sem API de teletransporte. O controlador antigo de patamares não está disponível no modo físico.

## M3 — atores e navegação

Um único coordenador atualiza os seis atores já existentes. Não cria Character, RoutineAgent, clone de rig ou listener. A posição canônica é mundial; agent.position é apenas a projeção no referencial usado pela UI atual. Entrada/saída não substitui estado nem retorna o NPC à posição anterior. Rotas pessoais passam por campus, recepção, corredores, biblioteca, ciência e salão; destinos verticais usam o mesmo U físico. O A* existente ganhou malha opcional de 0.5 para portas e patamares. Planejamento é escalonado e o grafo reutilizado, sem A* por ator por frame. Uma reserva por escadaria evita encontros frontais; obstáculos bloqueiam/replanejam, nunca reposicionam o ator.

O domínio opcional living.spatialActors preserva XYZ, cursor, tempo e direção; saves antigos usam os spawns/posições existentes na primeira migração. Portões consideram jogador e NPCs, inclusive quando o jogador está em outro piso. Cenas mantêm suas falas e poses mas não podem reposicionar personagens para uma marca de encenação.

Validação M3: testes unitários percorreram campus → salão → descida com continuidade de Y e mesma instância; os três testes de navegador de entrada, subida, descida e retomada passaram. Capturas reais de Davi subindo/descendo foram mostradas no chat. Teste adicional da entrada com jogador longe do portão será incluído na revisão final.
