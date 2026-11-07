# Versão 0.4 — O Colégio Vivo

## Auditoria e base preservada

O ponto de partida é a 0.3 efetivamente publicada em main (`40cb0e43ec7ba04e31269a485bf4151025d8f5e1`). A auditoria está em [AUDITORIA-04.md](AUDITORIA-04.md). Antes de programar, passaram os 17 testes de lógica e 21 cenários Chromium existentes. O Color foi relido integralmente, e continuam válidas as comparações literais das 154 falas e da carta final.

Foram preservados prólogo/três lembranças, seis capítulos históricos e seus textos/datas, álbum e filtros, inventário, três minijogos, conquistas originais, GLB sob demanda, controles analógicos, portas, câmera com colisão e presets gráficos. Nenhum acontecimento novo altera as memórias do casal.

## Uma escola habitada

Há cinco NPCs fictícios, diferenciados por uniforme e função:

| NPC | Local habitual | Rotina e personalidade |
| --- | --- | --- |
| Bia | Biblioteca | Lê sentada, circula pelo pátio e observa o jardim; curiosa sobre livros. |
| Caio | Quadra | Percorre quadra, corredor e pátio; organiza o recreio com humor. |
| Prof. Helena | Sala de aula | Observa a sala, conversa no corredor e volta às atividades; incentiva perguntas. |
| Davi | Pavilhão musical | Alterna ensaio, conversa no pátio e passeio; gosta de ouvir as pausas. |
| Lia | Cantina | Atende, organiza o espaço e passa pelo pátio; acolhedora com a turma. |

As rotinas usam estados de caminhada, espera, observação, conversa, sentar, levantar, aceno e reação. Os atores giram gradualmente para o próximo ponto ou interlocutor. A marcha acompanha a velocidade percorrida. As geometrias do humanoide são compartilhadas entre instâncias; uniformes dos figurantes usam menos grupos de material sem substituir personagens por imagens.

A navegação A* percorre pontos conectados em uma grade de um metro, com validação de segmentos, prevenção de corte de cantos, subpassos, replanejamento e separação entre atores. NPCs abrem as mesmas portas físicas do jogador; não são teleportados através delas. Assentos têm ocupante designado: outros atores e jogador evitam o volume. As rotas voltam a avançar depois de interações. Pausa e menus congelam a simulação; na exploração o mundo continua funcionando sem depender de comandos do jogador.

Maria alterna pátio, biblioteca e sala. Quando o prólogo ou uma etapa de conversa exige sua presença, ela retorna por navegação ao ponto de encontro; o indicador segue sua posição real, inclusive durante o retorno. Fora desses momentos, circula e estuda. Na exploração livre, sua rotina também continua. Ela pode acenar e oferecer uma indicação contextual discreta; não inicia um diálogo modal forçado. Não há pontuação de amor, compatibilidade ou aprovação para o casal.

## Três acontecimentos completos

1. **O Livro Perdido:** converse com Bia, aceite ajudar, encontre o livro identificado na biblioteca e devolva-o numa nova conversa. A entrega conclui o encontro, libera conquista e amizade.
2. **A Pergunta Impossível:** aceite o enigma de Helena, escolha uma hipótese e leia a explicação sobre queda livre sem resistência do ar. A hipótese escolhida é salva; uma resposta errada recebe explicação e ainda permite concluir. Se a explicação for interrompida, é possível retomá-la.
3. **Uma Música Conhecida:** converse com Davi, encontre a partitura no pavilhão, ouça uma composição sintetizada original e uma fala criativa do Narrador, depois compartilhe a descoberta com Davi. A conversa de retorno conclui o encontro.

Cada encontro tem começo, desenvolvimento, conclusão, persistência e recompensa idempotente. Na exploração livre, encontros concluídos podem ser repetidos sem multiplicar amizade ou apagar a primeira data da conquista. O bilhete no corredor é uma surpresa humorística adicional. O mistério da sala fechada fica para uma próxima versão e não aparece como missão pronta.

## Amizade, decisões e atividades opcionais

Amizade de 0 a 5 existe exclusivamente para os cinco NPCs fictícios. Conversas, encontros e atividades dão créditos únicos, com IDs estáveis para evitar repetição de recompensa. Com dois pontos, cada NPC oferece conversa especial e uma pequena atividade de escolha: ordem alfabética com Bia, colaboração na quadra com Caio, energia cinética com Helena, pausas musicais com Davi e higiene da cantina com Lia. As respostas têm explicação, conclusão e resultado persistido. Não são anunciadas como novos minijogos do catálogo Color.

O menu **Colégio vivo** apresenta personagens, amizade e andamento dos encontros. **Histórico de conversas** conserva as últimas 60 falas lidas, com identificação de origem. Escolhas e decisões secundárias são salvas; não reescrevem fatos históricos. Falas novas são identificadas como ficção do Colégio Aurora, e as falas criativas do Color continuam separadas das memórias relatadas pelo autor.

## Cenário, interface e áudio

- Cantina acessível atrás das alas, com balcão, mesas, cardápio, alimentos decorativos e lanche virtual no inventário. Não há compra ou transação real.
- Quadra compacta a oeste, com marcações, cesta e bola que pode ser impulsionada por interação. Personagens próximos podem reagir.
- Biblioteca ganhou assentos; corredores têm armários, cartazes, relógio e ventiladores. Jardins receberam flores instanciadas; o pavilhão musical original foi preservado.
- Materiais Standard físicos, iluminação interna ajustada ao preset, exposição interpolada nos interiores e distância de câmera reduzida nas salas. Enquadramento de conversa considera os participantes e respeita colisões.
- HUD de exploração mais compacto, mantendo objetivo, interação, progresso e notificações.
- Controles móveis com tamanho/opacidade configuráveis, além de sensibilidade, corrida e multitouch independente. Teclado e mouse preservados.
- Volumes separados de música e efeitos, com volume geral e mute. Passos, portas, confirmação, bola e vento usam síntese; músicas originais do projeto continuam disponíveis. Não foram adicionadas gravações comerciais.
- Minijogos têm instruções, botão de início, placar, encerramento, retorno e recorde salvo. Os outros cinco jogos Color continuam explicitamente planejados.

## Campanha e exploração livre

O menu inicial oferece entrada direta na exploração livre. O menu do colégio reúne continuar, nova campanha, exploração livre, retomar campanha, capítulos, álbum, inventário, minijogos, conquistas, histórico e configurações. Alternar o modo não apaga a campanha. Novas memórias só são desbloqueadas na campanha; memórias já abertas podem ser revisitadas. NPCs, acontecimentos, cantina, quadra e minijogos continuam utilizáveis no modo livre.

## Salvamento e recursos

O esquema v04 acrescenta modo, encontros, amizade, recompensas únicas, decisões, histórico, lanches e relógio da simulação. O carregamento tenta v04, depois v03 e v02. Registros antigos permanecem intactos. Preferências novas são validadas e recebem padrões compatíveis com o volume anterior. A posição é conferida contra o cenário após a expansão.

Há culling dos figurantes por distância; em Baixa, até dois figurantes fictícios próximos ficam visíveis, mas os cinco continuam simulados. Maria permanece um ator próprio. Sombras de figurantes se restringem ao preset Alto e à proximidade. Formas estáticas adicionais são agrupadas por material, incluindo o pavilhão da 0.3. A aba oculta suspende o loop; interfaces e partidas liberam referências ao sair, e recursos GPU são descartados ao encerrar. As fases dos NPCs reiniciam ao carregar a cena; progresso de encontros e decisões é persistente, não a transformação exata de cada ator.

## Limitações e itens adiados

- Os personagens são humanoides de estudo, sem novos modelos GLB licenciados. Não há expressões faciais complexas, captura de movimento ou IK de pés. Acenos, posturas, orientação, gestos e transições usam as articulações disponíveis.
- A escola continua em um plano de colisão horizontal. Escadas e segundo andar foram adiados para não introduzir degraus visuais sem navegação vertical funcional.
- Rotinas são ciclos curtos de atividades, não uma simulação escolar por calendário ou uma agenda biográfica real da Maria.
- A física da bola é simplificada e limitada à quadra; não há partida esportiva completa.
- Bilhete é uma interação extra; o mistério da sala fechada ainda não está implementado.
- Os cinco minijogos restantes, batalhas e troca de protagonista não foram acrescentados.
- Não foram usados Galaxy S24 Ultra ou A35 físicos. Chromium com toque emulado verifica fluxo/layout, não FPS, temperatura ou consumo desses aparelhos.
- Mantém-se o aviso de chunk grande do Three.js na build. Falas e GLTFLoader carregam separadamente. Não há pós-processamento pesado ou texturas fotográficas externas.

## Execução

```sh
npm ci
npm run dev
# Abra http://localhost:5173
npm run test:unit
npx playwright install chromium
npm test
npm run build
npm run preview
```

No Chromebook, pare o servidor com Ctrl+C, rode `git pull --ff-only`, `npm ci` e `npm run dev`. Para Android na mesma rede, use o IP do computador e encaminhe a porta 5173 no Linux do Chromebook quando necessário. Para hospedagem estática, use `dist/`; configure o base do Vite se publicar num subdiretório.

## Recomendações seguintes

Receber modelos GLB licenciados com clipes; medir CPU/GPU, memória e aquecimento nos dois Samsung; refinar navegação com mais densidade de atores, câmera interior e movimento dos pés; só então planejar navegação vertical e o mistério da sala fechada. Expandir encontros curtos com escolhas é preferível a aumentar o mapa sem conteúdo.

## Arquivos modificados

- `README.md`
- `index.html`
- `package-lock.json`
- `package.json`
- `src/character-assets.js`
- `src/main.js`
- `src/style.css`
- `src/systems/audio.js`
- `src/systems/camera.js`
- `src/systems/character.js`
- `src/systems/dialogue.js`
- `src/systems/progress.js`
- `src/systems/story-world.js`
- `src/systems/story.js`
- `src/systems/world.js`
- `tests/game.spec.js`
- `tests/story.spec.js`
- `tests/unit/story.test.js`

## Arquivos adicionados

- `docs/AUDITORIA-04.md`
- `docs/ENTREGA-04.md`
- `src/data/activities.json`
- `src/data/events.json`
- `src/data/npcs.json`
- `src/systems/atmosphere.js`
- `src/systems/campus-world.js`
- `src/systems/events.js`
- `src/systems/living.js`
- `src/systems/navigation.js`
- `src/systems/npcs.js`
- `src/systems/preferences.js`
- `src/systems/social.js`
- `tests/living.spec.js`
- `tests/unit/living.test.js`

## Resultados finais

- `npm run build`: aprovado, 46 módulos, bundle principal de aproximadamente 673 kB / 186 kB gzip; falas e GLTFLoader em chunks separados. Aviso de chunk acima de 500 kB documentado, sem erro de compilação.
- `npm run test:unit`: **23 aprovados**. Inclui importação literal preservada, migração v02/v03→v04, requisitos/recompensas, navegação A*, atores e amizade. Uma simulação de **150 segundos** com todos os obstáculos da escola verifica que os seis atores caminham, completam múltiplas etapas, não entram em volumes sólidos nem se sobrepõem; contempla exceção legítima do próprio assento.
- `npm test`: **27 cenários aprovados** na execução completa final (aproximadamente seis minutos). Inclui prólogo, seis memórias, minijogos, câmera/colisões, orçamento de desenho, multitouch, orientação, modo livre, três eventos de ponta a ponta, retomada de explicação interrompida, histórico, amizade/atividade opcional e preferências Android persistentes.
- O teste de orçamento da 0.3 continua aprovado: menos de 160 draw calls e 110 geometrias GPU no cenário observado em Baixa. Isso não é medição de FPS ou desempenho em Samsung real.
- Testes de eventos restauram posições salvas para isolar interações distantes; a navegação pelo mapa é validada nos testes de movimento e simulação. Não se declara uma caminhada manual contínua por todos os eventos.
- Captura da exploração inspecionada. Não houve testes físicos em S24 Ultra ou A35.
- As animações de assento são usadas nas rotinas dos personagens; ainda não há comando livre para o jogador escolher qualquer banco e sentar.

Durante a validação foram corrigidos um destino de rotina sobreposto a um armário e o fluxo de retomada do enigma. O orçamento gráfico foi recuperado simplificando grupos de material dos figurantes e agrupando formas estáticas do pavilhão, sem aumentar o limite do teste.
