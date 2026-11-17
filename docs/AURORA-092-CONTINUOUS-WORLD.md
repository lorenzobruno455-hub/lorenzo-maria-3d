# Aurora 0.9.2 — continuidade física

Base: feat/aurora-narrative-expansion, 18fa519 (PR #19), limpa após fetch. Main não alterada. Sem novas missões, reescrita de diálogos ou publicação.

## M1 — auditoria e projeto

Medidas em unidades do jogo, não medidas da escola real: envelope X ±11, Z ±19; pisos Y 0.03 / 3.63 / 7.23, espaçamento 3.60. Corredor central X -2..2. Escadaria antiga do térreo ocupa X -11..-2, Z -0.5..5.5; a do segundo pavimento ocupa X -11..-2, Z -8..-2. Os recintos não se sobrepõem em planta. A API antiga transition/useStair muda imediatamente piso/posição. SchoolNarrative.enter/leave troca rotas e restaura poses de NPCs, impedindo viagens independentes do jogador.

Decisão final: escadarias em U dentro da sala de escadas do térreo, alinhando integralmente os ambientes afetados do segundo piso. Corredores permanecem livres. A proposta preliminar no corredor foi descartada a pedido do proprietário; não faz parte da implementação. Medidas e remapeamentos finais abaixo.

Plano de execução: M2 geometria/vãos/motor/câmera/save Y, testes de continuidade/parada/inversão; M3 um gerenciador compartilhado de rotas 3D para os atores existentes, posições mundiais persistentes e atualização escalonada; M4 adaptação de objetivos e registros de navegação, regressão focada e build. Cada marco recebe commit, sem pausa de aprovação entre marcos conforme instrução do proprietário.

Os testes antigos que acionam E em um patamar não validam mais escadas e precisam de cobertura por caminhada física; não serão mantidos como atalhos ocultos. Saves antigos conservam os domínios narrativos; somente posições inválidas após a abertura de um vão são recuperadas pelo resolvedor já existente. Saves novos registram Y e estado espacial dos NPCs.

## Correção arquitetônica solicitada pelo proprietário

A proposta inicial no corredor foi descartada antes da entrega. O proprietário determinou escadas dentro da sala de escadas e autorizou reorganizar ambientes inteiros para obter um encaixe coerente. A escadaria em U agora ocupa X -10.3..-3.1, Z 0.6..4.4, dentro da sala existente do térreo X -11..-2, Z -0.5..5.5. O vão no salão e no segundo piso coincide com essa área, fora do corredor X -2..2.

Segundo piso: Sala B passa de Z 5..12 para 5.5..12; banheiro masculino vai para -8..-4.25; banheiro feminino para -4.25..-0.5; sala de escadas passa para -0.5..5.5. Os quatro ambientes mantêm seus IDs e funções, com paredes, portas, pisos e mobiliário remapeados integralmente. A sala de ciências, os ambientes da direita, os corredores e a arquitetura do térreo não são deslocados. A matriz JSON original permanece intacta; a adaptação é explícita no carregamento e não deixa partes de cômodos antigos.

M2 validado em navegador: subida pelos dois lances de cada piso, parada/inversão, reload em uma altura intermediária preservada, chegada ao salão e descida física pelos mesmos lances até o térreo. Duas capturas reais registradas. O teste usa somente teclas e leitura de diagnóstico, sem API de teletransporte. O controlador antigo de patamares não está disponível no modo físico.

## M3 — atores e navegação

Um único coordenador atualiza os seis atores já existentes. Não cria Character, RoutineAgent, clone de rig ou listener. A posição canônica é mundial; agent.position é apenas a projeção no referencial usado pela UI atual. Entrada/saída não substitui estado nem retorna o NPC à posição anterior. Rotas pessoais passam por campus, recepção, corredores, biblioteca, ciência e salão; destinos verticais usam o mesmo U físico. O A* existente ganhou malha opcional de 0.5 para portas e patamares. Planejamento é escalonado e o grafo reutilizado, sem A* por ator por frame. Uma reserva por escadaria evita encontros frontais; obstáculos bloqueiam/replanejam, nunca reposicionam o ator.

O domínio opcional living.spatialActors preserva XYZ, cursor, tempo e direção; saves antigos usam os spawns/posições existentes na primeira migração. Portões consideram jogador e NPCs, inclusive quando o jogador está em outro piso. Cenas mantêm suas falas e poses mas não podem reposicionar personagens para uma marca de encenação.

Validação M3: testes unitários percorreram campus → salão → descida com continuidade de Y e mesma instância; os três testes de navegador de entrada, subida, descida e retomada passaram. Capturas reais de Davi subindo/descendo foram mostradas no chat. O teste de entrada foi repetido com o jogador afastado do portão e passou, confirmando abertura independente para NPCs.

## M4 — integração e regressão

Versão identificada como 0.9.2. Objetivos em outro piso apontam para o acesso físico da escada; objetivos entre campus e escola apontam para o portão da recepção. Atores de missão aguardam em locais alcançáveis, mantendo a mesma instância e o progresso. Não foram adicionadas missões, falas ou recompensas. As seis memórias históricas, as rádios, os presets e os controles existentes foram preservados.

Regressão unitária: **192 testes passaram**, incluindo campanha, progressão, saves, missões, rotas e geometria. Navegador: caminhada pelos três pisos com parada/inversão e reload no meio da escada; NPC entrando independentemente do jogador; subida/descida com reload e mesma instância; conversa de missão no terceiro andar; álbum histórico; corredor do segundo piso. Os testes antigos que usam E para mudar instantaneamente de piso não representam o comportamento autorizado e não foram usados como evidência.

Capturas reais em `docs/captures/092`: `stair-room-midflight.png`, `third-floor-stair-room.png`, `npc-reception-entry.png`, `npc-ascending.png`, `npc-descending.png`, `second-floor-free-corridor.png`, `historical-album-preserved.png` e captura Android após a verificação final. Nenhuma imagem foi gerada artificialmente.

Compatibilidade: chave de save e domínios históricos mantidos. Novos campos são opcionais e validados: Y físico e `living.spatialActors`. Saves antigos conservam progresso e utilizam a migração espacial inicial; saves novos conservam inclusive posição intermediária nas escadas. Recuperação explícita pelo ponto seguro continua sendo uma ação de resgate existente, separada da circulação normal, que não reposiciona personagens.

Limites: emulação Chromium com toque não substitui um Galaxy S24 Ultra físico. Não há medição de FPS real de aparelho. A inspeção visual em hardware permanece pendente. A escola continua usando carregamento por pavimento e seleção de visibilidade: um piso em circulação plana e dois durante a escada. Nenhuma dependência foi adicionada. Sem merge e sem deploy.

### Correção identificada pela captura Android

A captura expôs a câmera dentro da luminária da recepção: sua geometria estava fora dos obstáculos da câmera. O volume real de luminárias passa a ser considerado apenas na colisão da câmera; a física do jogador não mudou. Um teste unitário reproduziu a falha antes da correção e passou após ela. A entrada foi capturada novamente sem a oclusão.

### Métricas reproduzíveis

No preset Baixo, emulação Android 915×412, os três ciclos recepção → campus → recepção estabilizaram em 209 geometrias e 23 texturas. O contador frio era 203/23: seis geometrias foram enviadas à GPU na primeira circulação, permanecendo estáveis nas seguintes. Os draw calls e triângulos variam com posição, câmera, NPCs e culling; os valores de cada ciclo estão em `render-metrics.json`. São contadores do renderizador, não FPS ou memória total do dispositivo. O teste também verifica UUIDs constantes para Lorenzo e seis NPCs, continuidade da posição mundial e campanha inalterada.

Build de produção aprovado. O aviso de chunk Three.js maior que 500 kB continua existente; não foi ampliado o escopo para uma divisão global de bundles.

### Reproduzir e testar no Android

Na branch `feat/aurora-092-continuous-world`, executar `npm ci`, `npm run test:unit` e `npm run build`. Os testes de navegador novos são `tests/physical-world092.spec.js`, `tests/continuous-actors092.spec.js` e `tests/world-integration092.spec.js`; executar com Playwright/Chromium instalado. O teste físico completo usa até 300 s por causa da renderização em software no ambiente de validação.

Para validação manual, executar `npm run dev -- --host 0.0.0.0` e abrir no Chrome Android `http://IP-DO-COMPUTADOR:5173` na mesma rede. Caminhar até a recepção; subir pela sala de escadas, parar/inverter nos lances e continuar ao salão; voltar pelo mesmo caminho. Salvar/recarregar no meio da escada, acompanhar Davi e verificar uma conversa de missão. Confirmar toque, câmera e presets no aparelho físico. O servidor local não publica o projeto nem instala automaticamente uma PWA.
