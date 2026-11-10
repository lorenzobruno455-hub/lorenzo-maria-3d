# 0.9.1 — posição segura sem apagar progresso

A restauração do São Jorge verificava a posição antes de carregar os colisores do acabamento atual. Um save em (-6.5,-7.9), livre no layout inicial, podia terminar dentro de um móvel carregado depois. A restauração agora aguarda o piso e valida a posição contra as colisões atuais, inclusive as mundiais do térreo.

**Pausa → Voltar ao ponto seguro** retorna ao pátio central do campus, em (0,10), ao sul da fonte. A posição e os controles são restaurados; campanha, inventário, missões, memórias e modo de exploração são preservados. O botão não reinicia capítulo e não altera o formato v04. Durante uma cena narrativa, conclua ou pule a cena antes de usá-lo.

O resgate é uma ação manual explícita, independente da passagem normal pela porta. Também cancela uma restauração pendente, impedindo um retorno tardio à escola quando o carregamento termina. A posição final é salva após o retorno ao pátio.

Verificação: teste de save obstruído reproduzido antes da correção; retorno de piso superior por toque Android, preservação de progresso, recarga e movimento; oito direções livres em torno do ponto central; cancelamento de carga pendente. Os testes também conservam a travessia normal da porta e o botão de tela inteira. Sem dependências novas, reset de saves ou merge na main. A regressão completa acompanha o PR #12.

## Resultado da validação

Fonte `ebadc8df8f89d70d6042f75449612a7004194533`, publicada no mesmo endereço como 0.9.1. O usuário confirmou no Android que o personagem voltou a andar após usar o ponto seguro.

- 152/152 unitários, build de produção e seis cenários direcionados aprovados.
- [Regressão completa 42807860581](https://github.com/lorenzobruno455-hub/lorenzo-maria-3d/actions/runs/42807860581): 82/83 cenários aprovados, sem skips. O resultado agregado da CI é vermelho.
- Falha: `tests/sao-jorge08.spec.js`, **Android stairs and inspection use touch and remain within portrait viewport**. O auxiliar de caminhada esgotou o tempo ao retornar pelo patamar do segundo piso, com posição mundial (53.5,-5) e destino (53.5,-6).
- A repetição focada do mesmo cenário, com o mesmo código, passou em 1,6 minuto. A causa da intermitência não foi confirmada; fica registrada para investigação própria. A suíte inteira não foi repetida após essa confirmação.
- O teste novo confirma área livre em oito direções ao redor de (0,10), progressos preservados após recarga, controles por toque e cancelamento de carregamento tardio.

Sem merge na main. A atualização de hospedagem usa o repositório próprio do Sites e mantém endereço, audiência e armazenamento local.
